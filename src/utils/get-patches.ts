import { createDeepProxy } from "@novakod/deep-proxy";
import { Patch, PatchType } from "../types";
import { isPureObject } from "@novakod/is-pure-object";
import { deepClone } from "./deep-clone";

type MutateCb<Data extends object> = (data: Data) => void;

export function getPatches<Data extends object>(data: Data, mutateCb: MutateCb<Data>): Patch[] {
  const patches: Patch[] = [];

  const deepProxy = createDeepProxy(deepClone(data), {
    get({ target, key, path, reciever }) {
      if (typeof target[key] === "function" && !Array.isArray(target) && !isPureObject(target)) {
        console.log("proxified function get: ", key, target);
        return (...args: any[]) => {
          const prevTarget = deepClone(target);
          const result = Reflect.apply(target[key], target, args);
          const nextTarget = deepClone(target);

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
      if (key === "length" && Array.isArray(target)) return Reflect.set(target, key, value, reciever);

      let type: PatchType = "add";
      if (Object.hasOwn(target, key)) type = "update";

      patches.push({
        type,
        path,
        previousValue: deepClone(target[key]),
        nextValue: deepClone(value),
      });

      return Reflect.set(target, key, value, reciever);
    },
    deleteProperty({ target, key, path }) {
      patches.push({
        type: "remove",
        path,
        previousValue: deepClone(target[key]),
        nextValue: undefined,
      });

      return Reflect.deleteProperty(target, key);
    },
  });

  mutateCb(deepProxy);

  return patches;
}
