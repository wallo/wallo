import { z } from 'zod';

export const formSchema = z.object({
    platformName: z.string().min(1).max(50),
    callbackUrl: z.string().url()
});

export type FormSchema = typeof formSchema;
