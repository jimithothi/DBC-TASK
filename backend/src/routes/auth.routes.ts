import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  login
);

export default router; 