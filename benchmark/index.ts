import { Suite, Event } from "benchmark";
import { immutate } from "./..";
import { create } from "mutative";
import { enablePatches, produce } from "immer";
import { getData } from "./utils/get-data";

enablePatches();
const suite = new Suite();

let data = getData();

suite
  .on("cycle", (event: Event) => {
    console.log(String(event.target));
    data = getData();
  })
  .add("immutate push", () => {
    data = immutate(data, (data) => {
      data.push({
        index: data.length,
        name: `User ${data.length}`,
        birthday: new Date(),
      });
    })[0];
  })
  .add("mutative push", () => {
    data = create(
      data,
      (data) => {
        data.push({
          index: data.length,
          name: `User ${data.length}`,
          birthday: new Date(),
        });
      },
      { enablePatches: true }
    )[0];
  })
  .add("immer push", () => {
    data = produce(data, (data) => {
      data.push({
        index: data.length,
        name: `User ${data.length}`,
        birthday: new Date(),
      });
    });
  })
  .add("immutate unshift", () => {
    data = immutate(data, (data) => {
      data.unshift({
        index: data.length,
        name: `User ${data.length}`,
        birthday: new Date(),
      });
    })[0];
  })
  .add("mutative unshift", () => {
    data = create(
      data,
      (data) => {
        data.unshift({
          index: data.length,
          name: `User ${data.length}`,
          birthday: new Date(),
        });
      },
      { enablePatches: true }
    )[0];
  })
  .add("immer unshift", () => {
    data = produce(data, (data) => {
      data.unshift({
        index: data.length,
        name: `User ${data.length}`,
        birthday: new Date(),
      });
    });
  })

  .run({
    async: true,
  });
