import { useState, useEffect } from "react";
import { subscribeToBudget } from "../services/expenseService";

const useBudget = (userId) => {
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToBudget(userId, setBudget);
    return () => unsubscribe();
  }, [userId]);

  return { budget };
};

export default useBudget;
