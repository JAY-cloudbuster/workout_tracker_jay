import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/profile', authController.getProfile);
router.patch('/profile', validateBody(updateProfileSchema), authController.updateProfile);
router.patch('/change-password', validateBody(changePasswordSchema), authController.changePassword);

// Admin routes
router.get('/users', authorize(UserRole.ADMIN), authController.getAllUsers);

export default router;
