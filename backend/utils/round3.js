export const round3 = (num) => {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
};
