import { z } from 'zod';

export const actionFormSchema = z.object({
    id: z.string().min(1).max(1000),
    display: z.string().min(1).max(1000)
});

export type ActionFormSchema = typeof actionFormSchema;
