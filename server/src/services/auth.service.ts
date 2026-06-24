import User, { IUser } from '../models/User';
import { UserRole } from '../types';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../utils/tokens';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    const { name, username, email, password } = input;

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered');
      }
      throw new ConflictError('Username already taken');
    }

    // Generate verification token
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, emailVerificationToken).catch(console.error);

    // Generate tokens
    const tokenPayload = { userId: user._id.toString(), role: user.role as UserRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput) {
    const { email, password, rememberMe } = input;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = { userId: user._id.toString(), role: user.role as UserRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token (limit to 5 active sessions)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      rememberMe,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken: string) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.userId);

      if (!user || !user.refreshTokens.includes(token)) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Rotate refresh token
      const newTokenPayload = { userId: user._id.toString(), role: user.role as UserRole };
      const newAccessToken = generateAccessToken(newTokenPayload);
      const newRefreshToken = generateRefreshToken(newTokenPayload);

      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string) {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If an account exists with this email, a reset link will be sent' };
    }

    const resetToken = generatePasswordResetToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email (non-blocking)
    sendPasswordResetEmail(email, user.name, resetToken).catch(console.error);

    return { message: 'If an account exists with this email, a reset link will be sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return { message: 'Password reset successfully' };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check username uniqueness if being changed
    if (input.username && input.username !== user.username) {
      const existingUser = await User.findOne({ username: input.username });
      if (existingUser) {
        throw new ConflictError('Username already taken');
      }
    }

    Object.assign(user, input);
    await user.save();
    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(input.currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.password = input.newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}

export default new AuthService();
