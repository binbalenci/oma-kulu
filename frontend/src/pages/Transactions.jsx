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

const Transactions = () => {
  const { transactions, loading: transactionsLoading } = useTransaction();
  const { categories, loading: categoriesLoading } = useCategory();
  const [selectedType, setSelectedType] = useState("all");

  if (transactionsLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  // Filter transactions by type
  const filteredTransactions = transactions.filter(
    (transaction) => selectedType === "all" || transaction.type === selectedType
  );

  // Prepare data for the chart
  const chartData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0 };
    }
    if (transaction.type === "income") {
      acc[date].income += transaction.amount;
    } else {
      acc[date].expenses += transaction.amount;
    }
    return acc;
  }, {});

  const chartDataArray = Object.values(chartData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="space-y-6">
      {/* Type Filter */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-md ${
            selectedType === "all" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"
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
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
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
          {filteredTransactions.map((transaction) => {
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
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Transactions;
