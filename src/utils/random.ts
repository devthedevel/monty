const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Generates a random 5-character UUID
 */
export function randomUuid(): string {
    let str = '';

    for (let i = 0; i < 5; i++) {
        str += characters[Math.floor(Math.random() * characters.length)];
    }

    return str;
}

/**
 * Randomly selects an element from the given array and returns a tuple of the element
 * and the element's index
 * @param arr 
 */
export function randomElement<T>(arr: T[]): [T, number] {
    const idx = Math.floor(Math.random() * arr.length);
    return [arr[idx], idx];
}