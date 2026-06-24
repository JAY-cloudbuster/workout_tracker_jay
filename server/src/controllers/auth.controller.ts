// @ts-nocheck
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import authService from '../services/auth.service';
import { AuthRequest } from '../types';

class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: result,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    // Set refresh token in HTTP-only cookie
    const cookieMaxAge = result.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/api/v1/auth/refresh',
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  });

  logout = catchAsync(async (req: AuthRequest, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (req.user && refreshToken) {
      await authService.logout(req.user._id.toString(), refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    const result = await authService.refreshToken(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });

    res.json({
      success: true,
      message: 'Token refreshed',
      data: result,
    });
  });

  verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.verifyEmail(req.params.token);
    res.json({ success: true, ...result });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, ...result });
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, ...result });
  });

  getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await authService.getProfile(req.user!._id.toString());
    res.json({ success: true, data: user });
  });

  updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await authService.updateProfile(req.user!._id.toString(), req.body);
    res.json({ success: true, message: 'Profile updated', data: user });
  });

  changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await authService.changePassword(req.user!._id.toString(), req.body);
    res.json({ success: true, ...result });
  });

  getMe = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await authService.getProfile(req.user!._id.toString());
    res.json({ success: true, data: user });
  });

  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as unknown as string) || 1;
    const limit = parseInt(req.query.limit as unknown as string) || 20;
    const result = await authService.getAllUsers(page, limit);
    res.json({ success: true, ...result });
  });
}

export default new AuthController();
