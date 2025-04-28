import { useState } from "react";
import { useTransaction } from "../context/TransactionContext";
import { useCategory } from "../context/CategoryContext";

const Settings = () => {
  const { transactions, deleteTransaction } = useTransaction();
  const { categories, deleteCategory } = useCategory();
  const [isDeleting, setIsDeleting] = useState(false);

  console.log("Settings - transactions:", transactions);
  console.log("Settings - categories:", categories);

  const handleDeleteAll = async () => {
    if (
      !window.confirm("Are you sure you want to delete all data? This action cannot be undone.")
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all transactions
      for (const transaction of transactions) {
        await deleteTransaction(transaction.id);
      }

      // Delete all categories
      for (const category of categories) {
        await deleteCategory(category.id);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Data Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-2xl font-semibold text-gray-900">{transactions?.length || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
            <p className="text-2xl font-semibold text-gray-900">{categories?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your data, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAll}
          disabled={isDeleting}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete All Data"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
