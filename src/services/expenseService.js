import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "expenses";
const SETTINGS_COLLECTION = "userSettings";
const RECURRING_COLLECTION = "recurringExpenses";

export const addExpense = async (userId, expenseData) => {
  return addDoc(collection(db, COLLECTION), {
    ...expenseData,
    userId,
    createdAt: serverTimestamp(),
  });
};

export const deleteExpense = async (expenseId) => {
  return deleteDoc(doc(db, COLLECTION, expenseId));
};

export const subscribeToExpenses = (userId, callback) => {

  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    expenses.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
      return timeB - timeA;
    });

    callback(expenses);
  }, (error) => {
    console.error("Firestore Error:", error);
  });
};

export const setMonthlyBudget = async (userId, budget) => {
  return setDoc(doc(db, SETTINGS_COLLECTION, userId), { monthlyBudget: budget }, { merge: true });
};

export const subscribeToBudget = (userId, callback) => {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, userId), (docSnap) => {
    if (docSnap.exists() && docSnap.data().monthlyBudget !== undefined) {
      callback(docSnap.data().monthlyBudget);
    } else {
      callback(0); 
    }
  });
};

export const setCategoryBudgets = async (userId, categoryBudgets) => {
  return setDoc(doc(db, SETTINGS_COLLECTION, userId), { categoryBudgets }, { merge: true });
};

export const subscribeToCategoryBudgets = (userId, callback) => {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, userId), (docSnap) => {
    if (docSnap.exists() && docSnap.data().categoryBudgets) {
      callback(docSnap.data().categoryBudgets);
    } else {
      callback({});
    }
  });
};

export const addRecurring = async (userId, data) => {
  return addDoc(collection(db, RECURRING_COLLECTION), {
    ...data,
    userId,
    isActive: true,
    createdAt: serverTimestamp(),
  });
};

export const updateRecurring = async (id, data) => {
  return updateDoc(doc(db, RECURRING_COLLECTION, id), data);
};

export const deleteRecurring = async (id) => {
  return deleteDoc(doc(db, RECURRING_COLLECTION, id));
};

export const subscribeToRecurring = (userId, callback) => {
  const q = query(
    collection(db, RECURRING_COLLECTION),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const recurring = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(recurring);
  });
};

export const processRecurringExpenses = async (userId, recurringItems, existingExpenses) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); 

  for (const r of recurringItems) {
    if (!r.isActive || !r.nextDueDate) continue;

    let nextDue = new Date(r.nextDueDate);
    nextDue.setHours(0, 0, 0, 0);

    const endDate = r.endDate ? new Date(r.endDate) : null;

    let advanced = false;

    while (nextDue <= today) {

      if (endDate && nextDue > endDate) {
        await updateRecurring(r.id, { isActive: false });
        break;
      }

      const yearMonth = `${nextDue.getFullYear()}-${nextDue.getMonth()}`;
      const alreadyLogged = existingExpenses.some((e) => {
        if (e.recurringId !== r.id) return false;
        const ed = new Date(e.date);
        return `${ed.getFullYear()}-${ed.getMonth()}` === yearMonth;
      });

      if (!alreadyLogged) {
        const dateStr = nextDue.toISOString().split("T")[0];
        await addExpense(userId, {
          amount: Number(r.amount),
          category: r.category,
          date: dateStr,
          description: r.description || "Recurring Expense",
          recurringId: r.id,
          autoLogged: true,
        });
      }

      const next = new Date(nextDue);
      if (r.frequency === "Monthly")  next.setMonth(next.getMonth() + 1);
      else if (r.frequency === "Weekly") next.setDate(next.getDate() + 7);
      else if (r.frequency === "Yearly") next.setFullYear(next.getFullYear() + 1);
      else break; 

      nextDue = next;
      advanced = true;
    }

    if (advanced) {
      await updateRecurring(r.id, { nextDueDate: nextDue.toISOString().split("T")[0] });
    }
  }
};

export const exportToCSV = (expenses, filename = "expenses.csv") => {
  if (!expenses || expenses.length === 0) return;

  const headers = ["Date", "Category", "Description", "Amount (₹)"];

  const rows = expenses.map(e => {
    const date = e.date ? new Date(e.date).toLocaleDateString("en-IN") : "";
    const category = `"${e.category || ""}"`;
    const description = `"${(e.description || "").replace(/"/g, '""')}"`; 
    const amount = e.amount;
    return [date, category, description, amount].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
