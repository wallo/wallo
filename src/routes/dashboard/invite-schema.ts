import { z } from 'zod';

export const inviteFormSchema = z.object({
    platformId: z.string()
});

export type InviteFormSchema = typeof inviteFormSchema;
