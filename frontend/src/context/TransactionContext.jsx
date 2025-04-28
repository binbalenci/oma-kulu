import { createContext, useContext, useState, useEffect } from "react";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const response = await fetch(`${API_URL}/transactions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      const data = await response.json();
      setTransactions([data, ...transactions]);
    } catch (error) {
      setError(error.message);
    }
  };

  const updateTransaction = async (id, transaction) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      const data = await response.json();
      setTransactions(transactions.map((t) => (t.id === id ? data : t)));
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
};
