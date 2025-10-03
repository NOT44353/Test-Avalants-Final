import { Router } from 'express';
import { nodeController } from '../controllers/NodeController';

const router = Router();

// Node routes
router.get('/root', nodeController.getRootNodes.bind(nodeController));
router.get('/search', nodeController.searchNodes.bind(nodeController));
router.get('/stats', nodeController.getNodeStats.bind(nodeController));
router.get('/:id', nodeController.getNodeById.bind(nodeController));
router.get('/:id/children', nodeController.getNodeChildren.bind(nodeController));
router.get('/:id/breadcrumb', nodeController.getBreadcrumb.bind(nodeController));

export default router;

