import { klona } from "klona";
import { MutateCb, Patch } from "../types";
import { proxify } from "./proxify";

export function getPatches<Data extends object>(data: Data, mutateCb: MutateCb<Data>): [Patch[], Patch[]] {
  const patches: Patch[] = [];
  const reversePatches: Patch[] = [];

  const proxified = proxify(klona(data), (patch, reversePatch) => {
    patches.push(patch);
    reversePatches.push(reversePatch);
  });

  mutateCb(proxified);

  return [patches, reversePatches];
}
