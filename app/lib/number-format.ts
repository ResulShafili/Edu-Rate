export function formatDecimalScore(value: number) {
  return value.toFixed(1).replace(".", ",");
}

export function formatInteger(value: number) {
  return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
