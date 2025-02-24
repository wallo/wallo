import { z } from 'zod';

export const editRuleSchema = z.object({
    ruleId: z.string(),
    readableName: z.string(),
    title: z.string().min(1).max(100),
    description: z.string().max(1000)
});

export type EditRuleSchema = typeof editRuleSchema;

export const createRuleSchema = z.object({
    readableName: z.string(),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000)
});

export type CreateRuleSchema = typeof createRuleSchema;

export const archiveRuleSchema = z.object({
    ruleId: z.string()
});

export type ArchiveRuleSchema = typeof archiveRuleSchema;
