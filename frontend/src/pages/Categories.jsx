import { useState } from "react";
import { motion } from "framer-motion";
import { useCategory } from "../context/CategoryContext";
import CategoryForm from "../components/CategoryForm";
import ConfirmationModal from "../components/ConfirmationModal";

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleAddCategory = async (formData) => {
    await addCategory(formData);
    setIsAddModalOpen(false);
  };

  const handleUpdateCategory = async (formData) => {
    await updateCategory(selectedCategory.id, formData);
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    await deleteCategory(selectedCategory.id);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => {
            setSelectedCategory({
              name: "",
              type: "expense",
              color: "#10B981",
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow"
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Categories</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="text-white font-medium">{category.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.type}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <CategoryForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleAddCategory}
        initialData={selectedCategory}
      />

      <CategoryForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleUpdateCategory}
        initialData={selectedCategory}
        mode="update"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
};

export default Categories;
