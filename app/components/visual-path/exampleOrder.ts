export function shuffledExampleOrder(
  length: number,
  random: () => number = Math.random,
  avoidFirst = -1,
): number[] {
  const order = Array.from({ length: Math.max(0, length) }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = order[index];
    const other = order[swapIndex];
    if (current === undefined || other === undefined) continue;
    order[index] = other;
    order[swapIndex] = current;
  }
  if (order.length > 1 && order[0] === avoidFirst) {
    const replacementIndex = order.findIndex((value) => value !== avoidFirst);
    if (replacementIndex > 0) {
      const first = order[0];
      const replacement = order[replacementIndex];
      if (first !== undefined && replacement !== undefined) {
        order[0] = replacement;
        order[replacementIndex] = first;
      }
    }
  }
  return order;
}
