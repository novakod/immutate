export type Patch = {
  type: PatchType;
  path: (string | symbol)[];
  previousValue: unknown;
  nextValue: unknown;
};

export type PatchType = "add" | "remove" | "update";
