import { z } from 'zod';

export const postSchema = z.object({
    caption: z.string()
        .min(1, 'Caption is required')
        .max(500, 'Caption cannot be more than 500 characters'),
    image: z.string().optional()
});

export const commentSchema = z.object({
    text: z.string()
        .min(1, 'Comment text is required')
        .max(200, 'Comment cannot be more than 200 characters')
});

export const shareSchema = z.object({
    sharedWith: z.array(z.string())
        .min(1, 'At least one person to share with is required')
}); 