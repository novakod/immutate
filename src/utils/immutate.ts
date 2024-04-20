import { klona } from "klona";
import { MutateCb, Patch } from "../types";
import { proxify } from "./proxify";

export function immutate<Data extends object>(data: Data, mutateCb: MutateCb<Data>): [Data, Patch[], Patch[]] {
  const copiedData = klona(data);

  const patches: Patch[] = [];
  const reversePatches: Patch[] = [];

  const proxified = proxify(copiedData, (patch, reversePatch) => {
    patches.push(patch);
    reversePatches.push(reversePatch);
  });

  mutateCb(proxified);

  return [copiedData, patches, reversePatches];
}
