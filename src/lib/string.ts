export function restrict<T extends string>(
    value: string | null | undefined,
    allowedValues: readonly T[]
): T | null {
    if ((value ?? null) === null) return null;
    for (const allowedValue of allowedValues) {
        if (value === allowedValue) {
            return allowedValue;
        }
    }
    return null;
}
