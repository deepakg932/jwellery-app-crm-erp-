const round2 = (num) =>
  Math.round((Number(num) + Number.EPSILON) * 100) / 100;
export { round2 };