import { test, expect } from "vitest";
import { applyPatches, getPatches, reversePatches } from "../src/utils";
import { deepClone } from "@novakod/deep-clone";

test("Тестирование функции reversePatches на простых данных", () => {
  const data = {
    tags: ["first", "second"],
    count: 2,
  };

  const patches = getPatches(data, (data) => {
    data.tags.push("third");
    data.count = 3;
  });
  const copiedData = deepClone(data);
  applyPatches(copiedData, patches);
  const reversedPatches = reversePatches(patches);
  applyPatches(copiedData, reversedPatches);

  expect(copiedData).toEqual(data);
});

test("Тестирование функции reversePatches на сложных данных", () => {
  class Figure {
    propertiesMap = new Map();

    addProperty(name: string, value: any) {
      this.propertiesMap.set(name, value);
      return this;
    }
  }

  const data = {
    users: [
      {
        id: 1,
        name: "Мага",
        birthday: new Date(),
        figures: [new Figure()],
      },
    ],
    usersCount: 1,
  };

  const patches = getPatches(data, (data) => {
    data.users.push({
      id: 2,
      name: "Мага",
      birthday: new Date(),
      figures: [new Figure()],
    });
    data.usersCount++;
  });
  const copiedData = deepClone(data);
  applyPatches(copiedData, patches);
  const reversedPatches = reversePatches(patches);
  applyPatches(copiedData, reversedPatches);
  expect(copiedData).toEqual<typeof data>(data);

  // ====
  const patches2 = getPatches(data, (data) => {
    data.users[0].birthday.setMinutes(10);
    data.users[0].figures[0].addProperty("color", "red");
  });
  const copiedData2 = deepClone(data);
  applyPatches(copiedData2, patches2);
  const reversedPatches2 = reversePatches(patches2);
  applyPatches(copiedData2, reversedPatches2);
  expect(copiedData2).toEqual<typeof data>(data);
});
