import { dataStore } from '../models/DataStore';
import { Node, SearchResult } from '../types';

export class NodeService {
  /**
   * Get root nodes
   */
  async getRootNodes(): Promise<Node[]> {
    return dataStore.getRootNodes();
  }

  /**
   * Get children of a specific node
   */
  async getNodeChildren(nodeId: string): Promise<Node[]> {
    return dataStore.getNodeChildren(nodeId);
  }

  /**
   * Get node by ID
   */
  async getNodeById(nodeId: string): Promise<Node | null> {
    return dataStore.getNode(nodeId) || null;
  }

  /**
   * Search nodes with path information
   */
  async searchNodes(query: string, limit: number = 100): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const nodeIds = dataStore.searchNodes(query.trim());
    const results: SearchResult[] = [];

    for (const nodeId of nodeIds.slice(0, limit)) {
      const node = dataStore.getNode(nodeId);
      if (node) {
        const path = dataStore.getNodePath(nodeId);
        results.push({
          id: node.id,
          name: node.name,
          path
        });
      }
    }

    return results;
  }

  /**
   * Get all nodes that should be expanded for search results
   */
  async getNodesToExpand(searchResults: SearchResult[]): Promise<Set<string>> {
    const nodesToExpand = new Set<string>();

    for (const result of searchResults) {
      // Add all parent nodes in the path (except the result node itself)
      for (let i = 0; i < result.path.length - 1; i++) {
        nodesToExpand.add(result.path[i].id);
      }
    }

    return nodesToExpand;
  }

  /**
   * Get node statistics
   */
  async getNodeStats(): Promise<{
    totalNodes: number;
    rootNodes: number;
    maxDepth: number;
  }> {
    const allNodes = Array.from(dataStore['nodes'].values());
    const totalNodes = allNodes.length;
    const rootNodes = allNodes.filter(node => node.parentId === null).length;

    // Calculate max depth
    let maxDepth = 0;
    for (const node of allNodes) {
      const path = dataStore.getNodePath(node.id);
      maxDepth = Math.max(maxDepth, path.length);
    }

    return {
      totalNodes,
      rootNodes,
      maxDepth
    };
  }

  /**
   * Get subtree size (total nodes under a given node)
   */
  async getSubtreeSize(nodeId: string): Promise<number> {
    const visited = new Set<string>();
    const queue = [nodeId];
    let count = 0;

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      count++;

      const children = dataStore.getNodeChildren(currentId);
      for (const child of children) {
        queue.push(child.id);
      }
    }

    return count;
  }

  /**
   * Check if a node has children (without loading them)
   */
  async hasChildren(nodeId: string): Promise<boolean> {
    const node = dataStore.getNode(nodeId);
    return node ? node.hasChildren : false;
  }

  /**
   * Get breadcrumb path for a node
   */
  async getBreadcrumb(nodeId: string): Promise<Array<{ id: string; name: string }>> {
    return dataStore.getNodePath(nodeId);
  }
}

export const nodeService = new NodeService();

