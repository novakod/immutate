import { klona } from "klona/full";

export function deepClone<Data>(data: Data): Data {
  return klona(data);
}
