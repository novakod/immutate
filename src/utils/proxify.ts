import { createDeepProxy } from "@novakod/deep-proxy";
import { Patch, PatchType } from "../types";
import { isPureObject } from "@novakod/is-pure-object";
import { klona } from "klona";
import { reversePatch } from "./reverse-patch";

export function proxify<Data extends object>(data: Data, onPatch: (patch: Patch, reversePatch: Patch) => void): Data {
  return createDeepProxy(data, {
    get({ target, key, path, reciever }) {
      if (typeof target[key] === "function" && !Array.isArray(target) && !isPureObject(target)) {
        return (...args: any[]) => {
          const prevTarget = klona(target);
          const result = Reflect.apply(target[key], target, args);
          const nextTarget = klona(target);

          const patch: Patch = {
            type: "update",
            path: path.slice(0, -1),
            previousValue: prevTarget,
            nextValue: nextTarget,
          };

          onPatch(patch, reversePatch(patch));
          return result;
        };
      }

      return Reflect.get(target, key, reciever);
    },
    set({ target, key, value, path, reciever }) {
      if (key === "length" && Array.isArray(target)) return Reflect.set(target, key, value, reciever);

      let type: PatchType = "add";
      if (Object.hasOwn(target, key)) type = "update";

      const patch: Patch = {
        type,
        path,
        previousValue: klona(target[key]),
        nextValue: klona(value),
      };

      onPatch(patch, reversePatch(patch));

      return Reflect.set(target, key, value, reciever);
    },
    deleteProperty({ target, key, path }) {
      const patch: Patch = {
        type: "remove",
        path,
        previousValue: klona(target[key]),
        nextValue: undefined,
      };

      onPatch(patch, reversePatch(patch));

      return Reflect.deleteProperty(target, key);
    },
  });
}
