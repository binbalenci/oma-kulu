import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import IncomeExpense from './pages/IncomeExpense'
import Categories from './pages/Categories'
import Settings from './pages/Settings'

function App() {
  return (
    <FinanceProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/income-expense" element={<IncomeExpense />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinanceProvider>
  )
}

export default App
