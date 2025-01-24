import { timingSafeEqual as CryptoTimingSafeEqual, getRandomValues } from 'crypto';

function bytesToInteger(bytes: Uint8Array): bigint {
    return bytes.reduce((acc, byte) => acc * 0x100n + BigInt(byte), 0n);
}

function setRandomValues(bytes: Uint8Array): bigint {
    getRandomValues(bytes);
    return bytesToInteger(bytes);
}

function randomBytes(bytesCount: number): Uint8Array {
    const bytes = new Uint8Array(bytesCount);
    getRandomValues(bytes);
    return bytes;
}

export function generateSecret(
    bytesCount: number,
    alphabet: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string {
    const alphabetLength = alphabet.length;
    const alphabetLengthBigInt = BigInt(alphabetLength);

    const bytes = randomBytes(bytesCount);
    const value = bytesToInteger(bytes);

    let secret = '';
    let remaining = value;

    while (secret.length < bytesCount) {
        const remainder = Number(remaining % alphabetLengthBigInt);
        remaining /= alphabetLengthBigInt;

        secret += alphabet[remainder];
    }

    return secret;
}

export function generateApiSecret(): string {
    return generateSecret(32);
}

export function generateId(
    idLength: number = 20,
    alphabet: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string {
    const alphabetLength = alphabet.length;
    const alphabetLengthBigInt = BigInt(alphabetLength);

    const bitsPerChar = Math.log2(alphabetLength);
    const bytesCount = Math.ceil((idLength * bitsPerChar) / 8);

    const maxValidValue = alphabetLengthBigInt ** BigInt(idLength);
    const maxRandomlyGeneratedValue = 2n ** BigInt(bytesCount * 8);
    const maxValidMultipleValue =
        maxRandomlyGeneratedValue - (maxRandomlyGeneratedValue % maxValidValue);

    const bytes = randomBytes(bytesCount);

    let value = bytesToInteger(bytes);

    while (value >= maxValidMultipleValue) {
        // If the value is greater than the maximum valid multiple value, then it would cause modulo bias.
        // Generate a new value until it is within the range of 0 to maxValidMultipleValue.
        value = setRandomValues(bytes);
    }

    let id = '';
    let remaining = value;

    while (id.length < idLength) {
        const remainder = Number(remaining % alphabetLengthBigInt);
        remaining /= alphabetLengthBigInt;

        id += alphabet[remainder];
    }

    return id;
}

export function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    const encoder = new TextEncoder();

    const aEncoded = encoder.encode(a);
    const bEncoded = encoder.encode(b);

    if (aEncoded.byteLength !== bEncoded.byteLength) return false;

    return CryptoTimingSafeEqual(aEncoded, bEncoded);
}
