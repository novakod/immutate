import { createDeepProxy } from "@novakod/deep-proxy";
import { MutateCb, Patch, PatchType } from "../types";
import { isPureObject } from "@novakod/is-pure-object";
import { klona } from "klona";

export function getPatches<Data extends object>(data: Data, mutateCb: MutateCb<Data>): Patch[] {
  const patches: Patch[] = [];

  const deepProxy = createDeepProxy(klona(data), {
    get({ target, key, path, reciever }) {
      if (typeof target[key] === "function" && !Array.isArray(target) && !isPureObject(target)) {
        return (...args: any[]) => {
          const prevTarget = klona(target);
          const result = Reflect.apply(target[key], target, args);
          const nextTarget = klona(target);

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
        previousValue: klona(target[key]),
        nextValue: klona(value),
      });

      return Reflect.set(target, key, value, reciever);
    },
    deleteProperty({ target, key, path }) {
      patches.push({
        type: "remove",
        path,
        previousValue: klona(target[key]),
        nextValue: undefined,
      });

      return Reflect.deleteProperty(target, key);
    },
  });

  mutateCb(deepProxy);

  return patches;
}
