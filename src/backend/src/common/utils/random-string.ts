export const getRandomString = (n: number): string => {
  const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  return Array.from(crypto.getRandomValues(new Uint32Array(n)))
    .map((v) => S[v % S.length])
    .join('');
};
