// src/routes/protected.route.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Apply authentication to all routes in this file
router.use(authenticate);

// Example protected route
router.get('/profile', (req, res) => {
  // TypeScript now knows req.user exists because of the middleware
  res.json({
    user: {
      id: req.user!.id,
      username: req.user!.username,
      email: req.user!.email
    }
  });
});

// Example admin-only route
router.get('/admin', authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

export default router;