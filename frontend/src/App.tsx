import { Database, Home, TreePine, TrendingUp } from 'lucide-react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NodesPage } from './pages/NodesPage';
import { QuotesPage } from './pages/QuotesPage';
import { UsersPage } from './pages/UsersPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-xl font-bold text-gray-900"
                >
                  <Database className="w-8 h-8 text-blue-600" />
                  <span>Full-Stack Challenges</span>
                </Link>
              </div>

              <div className="flex items-center space-x-8">
                <Link
                  to="/"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/users"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Data Table</span>
                </Link>

                <Link
                  to="/nodes"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <TreePine className="w-4 h-4" />
                  <span>Tree View</span>
                </Link>

                <Link
                  to="/quotes"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Live Quotes</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/nodes" element={<NodesPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500">
              <p>Full-Stack Coding Challenges - Built with React, TypeScript, and Node.js</p>
              <p className="mt-2 text-sm">
                Performance optimized for 50,000+ records with real-time updates
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default App;

