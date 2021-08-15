const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Generates a random 5-character UUID
 * @returns 
 */
export const randomUuid = (): string => {
    let str = '';

    for (let i = 0; i < 5; i++) {
        str += characters[Math.floor(Math.random() * characters.length)];
    }

    return str;
}