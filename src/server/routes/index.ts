import { Router } from 'express';
import authRoutes from './auth';
import questionRoutes from './questions';
import interviewRoutes from './interviews';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/interviews', interviewRoutes);

export default router;