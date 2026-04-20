import { useState, useEffect } from "react";
import { subscribeToExpenses } from "../services/expenseService";

const useExpenses = (userId) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToExpenses(userId, (data) => {
      setExpenses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  return { expenses, loading };
};

export default useExpenses;
