export const malloc = (bytes) => new Array(bytes).fill(0);
export const balloc = (bytes) => new Array(bytes).fill(false);

export const hex = (v) => `0x${v.toString(16).toUpperCase()}`;
