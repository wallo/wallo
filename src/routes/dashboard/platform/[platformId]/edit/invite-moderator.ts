import { z } from 'zod';

export const inviteFormSchema = z.object({
    email: z.string().email()
});

export type InviteFormSchema = typeof inviteFormSchema;
