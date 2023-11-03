import { Patch } from "../types";

export function reversePatches(patches: Patch[]): Patch[] {
  return patches.reverse().map<Patch>((patch) => {
    switch (patch.type) {
      case "add":
        return {
          type: "remove",
          path: patch.path,
          previousValue: patch.nextValue,
          nextValue: patch.previousValue,
        };
      case "update":
        return {
          type: "update",
          path: patch.path,
          previousValue: patch.nextValue,
          nextValue: patch.previousValue,
        };
      case "remove":
        return {
          type: "add",
          path: patch.path,
          nextValue: patch.previousValue,
          previousValue: patch.nextValue,
        };
    }
  });
}
