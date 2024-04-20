export function getData(length = 1000) {
  return Array.from({ length }).map((_, i) => ({
    index: i,
    name: `User ${i}`,
    birthday: new Date(),
  }));
}
