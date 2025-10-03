import { Router } from 'express';
import { seedController } from '../controllers/SeedController';

const router = Router();

// Development/Seed routes
router.post('/', seedController.seedData.bind(seedController));
router.delete('/', seedController.clearData.bind(seedController));
router.get('/status', seedController.getSeedStatus.bind(seedController));

export default router;

