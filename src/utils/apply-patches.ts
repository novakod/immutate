import { Patch } from "../types";

export function applyPatches<Data extends object>(data: Data, patches: Patch[]): void {
  patches.forEach((patch) => {
    const nestedKeys = patch.path.slice(0, -1);
    const key = patch.path[patch.path.length - 1];
    const nestedData = nestedKeys.reduce((acc, key) => acc[key as keyof Data] as any, data);

    switch (patch.type) {
      case "add":
      case "update":
        nestedData[key as keyof Data] = patch.nextValue as any;
        break;
      case "remove":
        delete nestedData[key as keyof Data];
        break;
    }
  });
}
