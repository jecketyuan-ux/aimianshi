import jwt from 'jsonwebtoken';
import { config } from '@/shared/config';
import { UserDocument } from '@/server/models';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export class JwtUtils {
  static generateToken(user: UserDocument): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  static generateRefreshToken(user: UserDocument): string {
    const payload = {
      userId: user.id,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '30d',
    });
  }

  static verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}