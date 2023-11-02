import { createDeepProxy } from "@novakod/deep-proxy";
import { Patch, PatchType } from "../types";

type MutateCb<Data extends object> = (data: Data) => void;

export function getPatches<Data extends object>(data: Data, mutateCb: MutateCb<Data>): Patch[] {
  const patches: Patch[] = [];

  const deepProxy = createDeepProxy(structuredClone(data), {
    set({ target, key, value, path, reciever }) {
      console.log("set", { target, key, value, path, reciever });
      let type: PatchType = "add";
      if (Object.hasOwn(target, key)) type = "update";
      patches.push({
        type,
        path,
        previousValue: structuredClone(target[key]),
        nextValue: structuredClone(value),
      });

      target[key] = value;

      return true;
    },
    deleteProperty({ target, key, path }) {
      patches.push({
        type: "remove",
        path,
        previousValue: structuredClone(target[key]),
        nextValue: undefined,
      });
      return delete target[key];
    },
  });

  mutateCb(deepProxy);

  return patches;
}
