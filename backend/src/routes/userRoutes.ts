import { Router } from 'express';
import { userController } from '../controllers/UserController';

const router = Router();

// User routes
router.get('/', userController.getUsers.bind(userController));
router.get('/stats', userController.getUserStats.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.get('/:id/orders', userController.getUserOrders.bind(userController));

export default router;

