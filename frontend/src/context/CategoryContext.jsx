import { createContext, useContext, useState, useEffect } from "react";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category) => {
    try {
      const response = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error("Failed to add category");
      const data = await response.json();
      setCategories([...categories, data]);
    } catch (error) {
      setError(error.message);
    }
  };

  const updateCategory = async (id, category) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error("Failed to update category");
      const data = await response.json();
      setCategories(categories.map((c) => (c.id === id ? data : c)));
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};
