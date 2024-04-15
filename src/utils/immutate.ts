import { klona } from "klona";
import { MutateCb, Patch } from "../types";
import { applyPatches } from "./apply-patches";
import { getPatches } from "./get-patches";

export function immutate<Data extends object>(data: Data, mutateCb: MutateCb<Data>): [Data, Patch[]] {
  const patches = getPatches(data, mutateCb);

  const copiedData = klona(data);

  applyPatches(copiedData, patches);

  return [copiedData, patches];
}
