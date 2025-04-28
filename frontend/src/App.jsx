import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TransactionProvider } from "./context/TransactionContext";
import { CategoryProvider } from "./context/CategoryContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    document.title = "Oma Kulu | Benjamin";
  }, []);

  return (
    <Router>
      <TransactionProvider>
        <CategoryProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </CategoryProvider>
      </TransactionProvider>
    </Router>
  );
}

export default App;
