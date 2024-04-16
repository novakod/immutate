export function getData(length = 5000) {
  return Array.from({ length }).map((_, i) => ({
    index: i,
    name: `User ${i}`,
    birthday: new Date(),
  }));
}
