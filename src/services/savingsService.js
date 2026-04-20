import {
  collection, addDoc, deleteDoc, doc, query,
  where, onSnapshot, serverTimestamp, setDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

const SAVINGS_COLLECTION = "savings";
const SETTINGS_COLLECTION = "userSettings";

export const addSaving = async (userId, data) => {
  return addDoc(collection(db, SAVINGS_COLLECTION), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
};

export const deleteSaving = async (id) => {
  return deleteDoc(doc(db, SAVINGS_COLLECTION, id));
};

export const subscribeToSavings = (userId, callback) => {
  const q = query(collection(db, SAVINGS_COLLECTION), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const savings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    savings.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    callback(savings);
  });
};

export const setSavingsGoal = async (userId, goal) => {
  return setDoc(doc(db, SETTINGS_COLLECTION, userId), { savingsGoal: goal }, { merge: true });
};

export const subscribeToSavingsGoal = (userId, callback) => {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, userId), (docSnap) => {
    callback(docSnap.exists() ? (docSnap.data().savingsGoal || 0) : 0);
  });
};
