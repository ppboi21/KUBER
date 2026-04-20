import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { 
  subscribeToExpenses, 
  subscribeToBudget, 
  subscribeToCategoryBudgets, 
  subscribeToRecurring 
} from "../services/expenseService";

const ExpenseContext = createContext();

export const useExpenses = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // useCallback: memoize callbacks so they don't cause re-subscriptions on re-renders
  const handleExpenses = useCallback((data) => {
    setExpenses(data);
    setLoading(false);
  }, []);

  const handleBudget = useCallback((data) => {
    setMonthlyBudget(data);
  }, []);

  const handleCategoryBudgets = useCallback((data) => {
    setCategoryBudgets(data);
  }, []);

  const handleRecurring = useCallback((data) => {
    setRecurringExpenses(data);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let bUnsub, cbUnsub, rUnsub;

    const eUnsub = subscribeToExpenses(currentUser.uid, (data) => {
      handleExpenses(data);

      if (!bUnsub) bUnsub = subscribeToBudget(currentUser.uid, handleBudget);
      if (!cbUnsub) cbUnsub = subscribeToCategoryBudgets(currentUser.uid, handleCategoryBudgets);
      if (!rUnsub) rUnsub = subscribeToRecurring(currentUser.uid, handleRecurring);
    });

    return () => {
      if (eUnsub) eUnsub();
      if (bUnsub) bUnsub();
      if (cbUnsub) cbUnsub();
      if (rUnsub) rUnsub();
    };
  }, [currentUser, handleExpenses, handleBudget, handleCategoryBudgets, handleRecurring]);

  const value = {
    expenses,
    monthlyBudget,
    categoryBudgets,
    recurringExpenses,
    loading
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
