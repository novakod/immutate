import { createDeepProxy } from "@novakod/deep-proxy";
import { Patch, PatchType } from "../types";
import { isPureObject } from "@novakod/is-pure-object";

type MutateCb<Data extends object> = (data: Data) => void;

export function getPatches<Data extends object>(data: Data, mutateCb: MutateCb<Data>): Patch[] {
  const patches: Patch[] = [];

  const deepProxy = createDeepProxy(data, {
    get({ target, key, path, reciever }) {
      if (typeof target[key] === "function" && !Array.isArray(target) && !isPureObject(target)) {
        console.log("proxified function get: ", key, target);
        return (...args: any[]) => {
          const prevTarget = structuredClone(target);
          const result = Reflect.apply(target[key], target, args);
          const nextTarget = structuredClone(target);

          patches.push({
            type: "update",
            path: path.slice(0, -1),
            previousValue: prevTarget,
            nextValue: nextTarget,
          });
          return result;
        };
      }

      return Reflect.get(target, key, reciever);
    },
    set({ target, key, value, path, reciever }) {
      let type: PatchType = "add";
      if (Object.hasOwn(target, key)) type = "update";
      patches.push({
        type,
        path,
        previousValue: structuredClone(target[key]),
        nextValue: structuredClone(value),
      });

      return Reflect.set(target, key, value, reciever);
    },
    deleteProperty({ target, key, path }) {
      patches.push({
        type: "remove",
        path,
        previousValue: structuredClone(target[key]),
        nextValue: undefined,
      });

      return Reflect.deleteProperty(target, key);
    },
  });

  mutateCb(deepProxy);

  return patches;
}
