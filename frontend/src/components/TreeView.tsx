import { ChevronDown, ChevronRight, Folder, FolderOpen, Search } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Node, SearchResult } from '../types';

interface TreeViewProps {
  nodes: Node[];
  onNodeClick?: (node: Node) => void;
  onLoadChildren?: (nodeId: string) => Promise<Node[]>;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  searchResults?: SearchResult[];
  loading?: boolean;
  error?: string | null;
}

interface TreeNodeProps {
  node: Node;
  level: number;
  expanded: boolean;
  onToggle: (nodeId: string) => void;
  onNodeClick: (node: Node) => void;
  onLoadChildren?: (nodeId: string) => Promise<Node[]>;
  searchHighlight?: string;
  isSearchResult?: boolean;
  path?: Node[];
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(({
  node,
  level,
  expanded,
  onToggle,
  onNodeClick,
  onLoadChildren,
  searchHighlight,
  isSearchResult = false,
  path = []
}) => {
  const [children, setChildren] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!expanded && node.hasChildren && !hasLoaded && onLoadChildren) {
      setLoading(true);
      try {
        const childNodes = await onLoadChildren(node.id);
        setChildren(childNodes);
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading children:', error);
      } finally {
        setLoading(false);
      }
    }
    onToggle(node.id);
  }, [expanded, node.hasChildren, node.id, hasLoaded, onLoadChildren, onToggle]);

  const handleClick = useCallback(() => {
    onNodeClick(node);
  }, [node, onNodeClick]);

  const highlightText = useCallback((text: string, highlight?: string) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  }, []);

  const indentStyle = {
    paddingLeft: `${level * 20}px`
  };

  return (
    <div>
      <div
        className={`
          flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded
          ${isSearchResult ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}
        `}
        style={indentStyle}
        onClick={handleClick}
      >
        <button
          className="mr-1 p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          disabled={!node.hasChildren}
        >
          {node.hasChildren ? (
            loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center flex-1">
          {node.hasChildren ? (
            expanded ? (
              <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-gray-500" />
            )
          ) : (
            <div className="w-4 h-4 mr-2" />
          )}

          <span className="text-sm">
            {highlightText(node.name, searchHighlight)}
          </span>
        </div>
      </div>

      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={false}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
              onLoadChildren={onLoadChildren}
              searchHighlight={searchHighlight}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  onNodeClick,
  onLoadChildren,
  onSearch,
  searchResults = [],
  loading = false,
  error = null
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle search
  useEffect(() => {
    if (debouncedQuery && onSearch) {
      setSearchLoading(true);
      onSearch(debouncedQuery)
        .then(() => setSearchLoading(false))
        .catch(() => setSearchLoading(false));
    }
  }, [debouncedQuery, onSearch]);

  // Auto-expand search results
  useEffect(() => {
    if (searchResults.length > 0) {
      const newExpanded = new Set(expandedNodes);
      searchResults.forEach(result => {
        result.path.forEach(pathNode => {
          newExpanded.add(pathNode.id);
        });
      });
      setExpandedNodes(newExpanded);
    }
  }, [searchResults, expandedNodes]);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const searchResultIds = useMemo(() =>
    new Set(searchResults.map(result => result.id)),
    [searchResults]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-2 text-gray-600">Loading tree...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="tree-view">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-auto p-2">
        {nodes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No nodes available
          </div>
        ) : (
          <div>
            {nodes.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                expanded={expandedNodes.has(node.id)}
                onToggle={handleToggle}
                onNodeClick={handleNodeClick}
                onLoadChildren={onLoadChildren}
                searchHighlight={debouncedQuery}
                isSearchResult={searchResultIds.has(node.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search Results Info */}
      {searchResults.length > 0 && (
        <div className="p-2 bg-blue-50 border-t text-sm text-blue-600">
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TreeView;
