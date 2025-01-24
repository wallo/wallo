import { z } from 'zod';

export const commentFormSchema = z.object({
    comment: z.string().min(1).max(1000)
});

export type CommentFormSchema = typeof commentFormSchema;
