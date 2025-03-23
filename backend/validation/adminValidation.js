import { z } from 'zod';

export const adminRegisterSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters'),
    email: z.string()
        .email('Invalid email address')
        .min(5, 'Email is too short')
        .max(50, 'Email is too long'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const adminLoginSchema = z.object({
    email: z.string()
        .email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
}); 