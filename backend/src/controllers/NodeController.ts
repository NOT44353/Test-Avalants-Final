import { Request, Response } from 'express';
import { nodeService } from '../services/NodeService';

export class NodeController {
  /**
   * GET /api/nodes/root
   * Get root nodes
   */
  async getRootNodes(req: Request, res: Response): Promise<void> {
    try {
      const nodes = await nodeService.getRootNodes();

      res.json({
        success: true,
        data: { items: nodes }
      });
    } catch (error) {
      console.error('Error getting root nodes:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/nodes/:id/children
   * Get children of a specific node
   */
  async getNodeChildren(req: Request, res: Response): Promise<void> {
    try {
      const nodeId = req.params.id;

      if (!nodeId) {
        res.status(400).json({
          success: false,
          error: 'Node ID is required'
        });
        return;
      }

      // Check if node exists
      const node = await nodeService.getNodeById(nodeId);
      if (!node) {
        res.status(404).json({
          success: false,
          error: 'Node not found'
        });
        return;
      }

      const children = await nodeService.getNodeChildren(nodeId);

      res.json({
        success: true,
        data: { items: children }
      });
    } catch (error) {
      console.error('Error getting node children:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/nodes/:id
   * Get node by ID
   */
  async getNodeById(req: Request, res: Response): Promise<void> {
    try {
      const nodeId = req.params.id;

      if (!nodeId) {
        res.status(400).json({
          success: false,
          error: 'Node ID is required'
        });
        return;
      }

      const node = await nodeService.getNodeById(nodeId);

      if (!node) {
        res.status(404).json({
          success: false,
          error: 'Node not found'
        });
        return;
      }

      res.json({
        success: true,
        data: node
      });
    } catch (error) {
      console.error('Error getting node:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/search
   * Search nodes with path information
   */
  async searchNodes(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      if (limit < 1 || limit > 1000) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 1000'
        });
        return;
      }

      const results = await nodeService.searchNodes(query.trim(), limit);

      res.json({
        success: true,
        data: { items: results }
      });
    } catch (error) {
      console.error('Error searching nodes:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/nodes/:id/breadcrumb
   * Get breadcrumb path for a node
   */
  async getBreadcrumb(req: Request, res: Response): Promise<void> {
    try {
      const nodeId = req.params.id;

      if (!nodeId) {
        res.status(400).json({
          success: false,
          error: 'Node ID is required'
        });
        return;
      }

      const breadcrumb = await nodeService.getBreadcrumb(nodeId);

      res.json({
        success: true,
        data: { breadcrumb }
      });
    } catch (error) {
      console.error('Error getting breadcrumb:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/nodes/stats
   * Get node statistics
   */
  async getNodeStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await nodeService.getNodeStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting node stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const nodeController = new NodeController();

