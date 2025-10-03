import { Router } from 'express';
import { quoteController } from '../controllers/QuoteController';

const router = Router();

// Quote routes
router.get('/', quoteController.getAllQuotes.bind(quoteController));
router.get('/snapshot', quoteController.getQuoteSnapshot.bind(quoteController));
router.get('/stats', quoteController.getQuoteStats.bind(quoteController));
router.get('/movers', quoteController.getTopMovers.bind(quoteController));
router.get('/:symbol', quoteController.getQuote.bind(quoteController));

export default router;

