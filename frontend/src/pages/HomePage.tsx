import { ArrowRight, Database, TreePine, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const challenges = [
  {
    id: 1,
    title: 'Data Processing & Rendering',
    description: 'High-performance data table with 50,000+ records, server-side pagination, sorting, and filtering.',
    icon: Database,
    path: '/users',
    features: [
      'Server-side pagination',
      'Real-time search',
      'Multi-column sorting',
      'Aggregate calculations',
      'Virtual scrolling (bonus)'
    ],
    status: 'completed'
  },
  {
    id: 2,
    title: 'Tree & Hierarchy Rendering',
    description: 'Org Chart with lazy loading, search functionality, and auto-expansion of matched branches.',
    icon: TreePine,
    path: '/nodes',
    features: [
      'Lazy loading',
      'Search with highlighting',
      'Auto-expand matched branches',
      'Keyboard navigation',
      'Path breadcrumbs'
    ],
    status: 'completed'
  },
  {
    id: 3,
    title: 'Real-time Dashboard',
    description: 'Live-updating dashboard with stock quotes, charts, and WebSocket connectivity.',
    icon: TrendingUp,
    path: '/quotes',
    features: [
      'WebSocket real-time updates',
      'Live price charts',
      'Price change indicators',
      'Reconnection strategy',
      'Performance optimization'
    ],
    status: 'completed'
  }
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Full-Stack Coding Challenges
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive showcase of modern web development techniques including
            high-performance data processing, real-time updates, and advanced UI patterns.
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {challenges.map((challenge) => {
            const Icon = challenge.icon;
            const isCompleted = challenge.status === 'completed';

            return (
              <div
                key={challenge.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl ${
                  isCompleted ? 'ring-2 ring-green-200' : 'ring-2 ring-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Challenge {challenge.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {challenge.title}
                  </h4>

                  <p className="text-gray-600 mb-4">
                    {challenge.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {challenge.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={challenge.path}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isCompleted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isCompleted ? 'View Demo' : 'Coming Soon'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Technology Stack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Backend</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Node.js + Express</li>
                <li>TypeScript</li>
                <li>WebSocket</li>
                <li>Jest Testing</li>
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Frontend</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>React + TypeScript</li>
                <li>Vite</li>
                <li>React Router</li>
                <li>Recharts</li>
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Virtual Scrolling</li>
                <li>Debounced Search</li>
                <li>Memoization</li>
                <li>WebSocket Optimization</li>
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Server-side Pagination</li>
                <li>Real-time Updates</li>
                <li>Advanced Filtering</li>
                <li>Responsive Design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore?
          </h2>
          <p className="text-gray-600 mb-8">
            Click on any completed challenge to see it in action
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/users"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Database className="w-5 h-5 mr-2" />
              View Data Table
            </Link>
            <Link
              to="/quotes"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Live Quotes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

