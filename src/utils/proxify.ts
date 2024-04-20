import { createDeepProxy } from "@novakod/deep-proxy";
import { Patch, PatchType } from "../types";
import { isPureObject } from "@novakod/is-pure-object";
import { klona } from "klona";

export function proxify<Data extends object>(data: Data, onPatch: (patch: Patch) => void): Data {
  return createDeepProxy(data, {
    get({ target, key, path, reciever }) {
      if (typeof target[key] === "function" && !Array.isArray(target) && !isPureObject(target)) {
        return (...args: any[]) => {
          const prevTarget = klona(target);
          const result = Reflect.apply(target[key], target, args);
          const nextTarget = klona(target);

          onPatch({
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

      onPatch({
        type,
        path,
        previousValue: klona(target[key]),
        nextValue: klona(value),
      });

      return Reflect.set(target, key, value, reciever);
    },
    deleteProperty({ target, key, path }) {
      onPatch({
        type: "remove",
        path,
        previousValue: klona(target[key]),
        nextValue: undefined,
      });

      return Reflect.deleteProperty(target, key);
    },
  });
}
