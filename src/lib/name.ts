export function getInitials(name: string): string {
    const initials = name
        .split(' ')
        .filter((word) => word.length)
        .map((word) => word[0]);
    return initials.join('').toUpperCase();
}
