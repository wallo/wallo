import { z } from 'zod';

export const deleteModeratorFormSchema = z.object({
    id: z.string()
});

export type DeleteModeratorFormSchema = typeof deleteModeratorFormSchema;
