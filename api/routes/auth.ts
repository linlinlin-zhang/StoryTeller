/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
  verifyToken
} from '../controllers/authController';
import {
  authenticateToken,
  refreshTokenIfNeeded
} from '../middleware/auth';
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  createValidationMiddleware
} from '../middleware/validation';

const router = Router();

// 公开路由（不需要认证）
router.post('/register', createValidationMiddleware(validateUserRegistration), register);
router.post('/login', createValidationMiddleware(validateUserLogin), login);
router.post('/verify-token', verifyToken);

// 需要认证的路由
router.use(authenticateToken);
router.use(refreshTokenIfNeeded);

// 用户信息相关
router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.put('/change-password', createValidationMiddleware(validatePasswordChange), changePassword);

// 测试路由
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth route working!',
    user: req.user
  });
});

export default router;