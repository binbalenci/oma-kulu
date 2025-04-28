import { useState } from "react";
import { motion } from "framer-motion";
import { useTransaction } from "../context/TransactionContext";
import { useCategory } from "../context/CategoryContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TransactionForm from "../components/TransactionForm";
import ConfirmationModal from "../components/ConfirmationModal";

const Transactions = () => {
  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransaction();
  const { categories, loading: categoriesLoading } = useCategory();
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  if (transactionsLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (selectedType === "all") return true;
      return transaction.type === selectedType;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const recentTransactions = filteredTransactions.slice(0, 5);

  // Prepare data for the chart
  const chartData = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { income: 0, expense: 0 };
    }
    if (transaction.type === "income") {
      acc[date].income += transaction.amount;
    } else {
      acc[date].expense += transaction.amount;
    }
    return acc;
  }, {});

  const chartDataArray = Object.entries(chartData)
    .map(([date, amounts]) => ({
      date,
      income: amounts.income,
      expense: amounts.expense,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = async (formData) => {
    await addTransaction(formData);
    setIsAddModalOpen(false);
  };

  const handleUpdateTransaction = async (formData) => {
    await updateTransaction(selectedTransaction.id, formData);
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = async () => {
    await deleteTransaction(selectedTransaction.id);
    setIsDeleteModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedTransaction({
                type: "income",
                date: new Date().toISOString().split("T")[0],
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add Income
          </button>
          <button
            onClick={() => {
              setSelectedTransaction({
                type: "expense",
                date: new Date().toISOString().split("T")[0],
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Add Expense
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Type Filter */}
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded-md ${
              selectedType === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("income")}
            className={`px-4 py-2 rounded-md ${
              selectedType === "income" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setSelectedType("expense")}
            className={`px-4 py-2 rounded-md ${
              selectedType === "expense" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Expenses
          </button>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((transaction) => {
              const category = categories.find((c) => c.id === transaction.category_id);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category?.color }}
                    >
                      <span className="text-white font-medium">{category?.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{category?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsEditModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <TransactionForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleAddTransaction}
        categories={categories}
        initialData={selectedTransaction}
      />

      <TransactionForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleUpdateTransaction}
        categories={categories}
        initialData={selectedTransaction}
        mode="update"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
};

export default Transactions;
