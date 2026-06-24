import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import User from '../models/User';
import { AuthRequest, UserRole } from '../types';

/**
 * Authenticate user via JWT access token
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('No access token provided');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check user exists and is active
    const user = await User.findById(decoded.userId).select('_id role email isActive');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      role: user.role as UserRole,
      email: user.email,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired access token'));
    }
  }
};

/**
 * Authorize specific roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token present but doesn't require it
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('_id role email isActive');
      if (user && user.isActive) {
        req.user = {
          _id: user._id,
          role: user.role as UserRole,
          email: user.email,
        };
      }
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
};
