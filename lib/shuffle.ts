export function shuffleOptions(options) {
  return options
    .map((opt) => ({ sort: Math.random(), value: opt }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
}
