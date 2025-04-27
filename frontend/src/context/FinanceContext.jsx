import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const { data, error } = await supabase.from("transactions").insert([transaction]).select();

      if (error) throw error;
      setTransactions([data[0], ...transactions]);
    } catch (error) {
      setError(error.message);
    }
  };

  const getSummary = () => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  };

  const getCategoryBreakdown = () => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categories = {};

    expenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        getSummary,
        getCategoryBreakdown,
        fetchTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
