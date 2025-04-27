import { z } from 'zod';

export const cartItemSchema = z.object({
    productId: z.string()
        .min(1, 'Product ID is required'),
    quantity: z.number()
        .int()
        .min(1, 'Quantity must be at least 1'),
    price: z.number()
        .min(0, 'Price must be non-negative'),
    unit: z.string()
        .optional()
});

export const updateCartItemSchema = z.object({
    quantity: z.number()
        .int()
        .min(0, 'Quantity must be 0 or greater')
}); 