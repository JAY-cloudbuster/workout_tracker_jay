import jwt from 'jsonwebtoken';
import config from '../config';
import { ITokenPayload } from '../types';

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload as any, config.jwt.accessSecret as string, {
    expiresIn: config.jwt.accessExpiresIn,
  } as any);
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload as any, config.jwt.refreshSecret as string, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as any);
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as ITokenPayload;
};

export const generateEmailVerificationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export const generatePasswordResetToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};
