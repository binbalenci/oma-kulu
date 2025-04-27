import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = () => {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/income-expense', label: 'Income vs Expense' },
    { path: '/categories', label: 'Categories' },
    { path: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-primary-600"
          >
            Finance Tracker
          </motion.div>
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 