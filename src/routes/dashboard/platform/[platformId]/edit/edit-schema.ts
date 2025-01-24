import { z } from 'zod';

export const editFormSchema = z.object({
    platformName: z.string().min(1).max(50),
    callbackUrl: z.string().url()
});

export type EditFormSchema = typeof editFormSchema;
