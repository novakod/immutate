import { klona } from "klona";
import { MutateCb, Patch } from "../types";
import { proxify } from "./proxify";

export function immutate<Data extends object>(data: Data, mutateCb: MutateCb<Data>): [Data, Patch[]] {
  const copiedData = klona(data);

  const patches: Patch[] = [];

  const proxified = proxify(copiedData, (patch) => patches.push(patch));

  mutateCb(proxified);

  return [copiedData, patches];
}
