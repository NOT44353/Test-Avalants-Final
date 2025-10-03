import { RefreshCw, Search, TreePine } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import TreeView from '../components/TreeView';
import { apiService } from '../services/api';
import { Node, SearchResult } from '../types';

export function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Load root nodes
  const loadRootNodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNodes();
      setNodes(response.data.items || []);
    } catch (err) {
      console.error('Error loading root nodes:', err);
      setError('Failed to load root nodes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load children for a node
  const loadChildren = useCallback(async (nodeId: string): Promise<Node[]> => {
    try {
      const response = await apiService.getNodeChildren(nodeId);
      return response.data.items || [];
    } catch (err) {
      console.error('Error loading children:', err);
      throw err;
    }
  }, []);

  // Search nodes
  const searchNodes = useCallback(async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await apiService.searchNodes(query, 100);
      const results = response.data.items || [];
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Error searching nodes:', err);
      setSearchResults([]);
      return [];
    }
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  // Load initial data
  useEffect(() => {
    loadRootNodes();
  }, [loadRootNodes]);

  // Seed data if needed
  const handleSeedData = useCallback(async () => {
    try {
      setLoading(true);
      await apiService.seedNodes(20, 10);
      await loadRootNodes();
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to seed data');
    } finally {
      setLoading(false);
    }
  }, [loadRootNodes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TreePine className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tree & Hierarchy Rendering
                </h1>
                <p className="text-gray-600 mt-1">
                  Org Chart with lazy loading, search, and auto-expansion
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Seed Data</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Lazy Loading</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Children loaded on-demand</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Search & Highlight</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Real-time search with highlighting</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Auto-Expand</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Matches expand automatically</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Keyboard Nav</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Accessible navigation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-96">
              <TreeView
                nodes={nodes}
                onNodeClick={handleNodeClick}
                onLoadChildren={loadChildren}
                onSearch={searchNodes}
                searchResults={searchResults}
                loading={loading}
                error={error}
              />
            </div>
          </div>

          {/* Node Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border h-96">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Node Details</h3>
              </div>

              <div className="p-4">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedNode.id}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">{selectedNode.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Parent ID</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedNode.parentId || 'Root'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Has Children</label>
                      <p className="text-sm text-gray-900">
                        {selectedNode.hasChildren ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <TreePine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a node to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                <p className="text-sm text-gray-600">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => handleNodeClick({ id: result.id, name: result.name, parentId: null, hasChildren: false })}
                    >
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{result.name}</span>
                      </div>
                      {result.path && result.path.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Path: {result.path.map(p => p.name).join(' → ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NodesPage;
