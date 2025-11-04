import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface FacebookProfile {
  facebookId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface RequestWithUser extends Request {
  user: User;
}
