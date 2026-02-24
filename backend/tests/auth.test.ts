import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../src/services/auth.service.js';
import prisma from '../src/config/database.js';
import argon2 from 'argon2';

vi.mock('../src/config/database.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  it('should successfully signup a new user', async () => {
    const signupData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'author' as const,
    };

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({ ...signupData, id: 'uuid' });

    const result = await AuthService.signup(signupData);

    expect(result).toHaveProperty('id');
    expect(result.email).toBe(signupData.email);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    const signupData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'author' as const,
    };

    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

    await expect(AuthService.signup(signupData)).rejects.toThrow('Email already exists');
  });
});
