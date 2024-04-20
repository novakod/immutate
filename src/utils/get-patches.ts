import { klona } from "klona";
import { MutateCb, Patch } from "../types";
import { proxify } from "./proxify";

export function getPatches<Data extends object>(data: Data, mutateCb: MutateCb<Data>): Patch[] {
  const patches: Patch[] = [];

  const proxified = proxify(klona(data), (patch) => patches.push(patch));

  mutateCb(proxified);

  return patches;
}
