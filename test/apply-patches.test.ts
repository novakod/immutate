import { test, expect } from "vitest";
import { applyPatches, getPatches } from "../src/utils";
import { deepClone } from "@novakod/deep-clone";
import { setMinutes } from "date-fns";

test("Тестирование функции applyPatches на простых данных", () => {
  const data = {
    tags: ["first", "second"],
    count: 2,
  };

  const patches = getPatches(data, (data) => {
    data.tags.push("third");
    data.count++;
  });
  const copiedData = deepClone(data);
  applyPatches(copiedData, patches);
  expect(copiedData).toEqual<typeof data>({
    tags: ["first", "second", "third"],
    count: 3,
  });

  const patches2 = getPatches(data, (data) => {
    data.tags = [];
    data.count = 0;
  });
  const copiedData2 = deepClone(data);
  applyPatches(copiedData2, patches2);
  expect(copiedData2).toEqual<typeof data>({
    tags: [],
    count: 0,
  });
});

test("Тестирование функции applyPatches на сложных данных", () => {
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

  const newUser = {
    id: 2,
    name: "Мага",
    birthday: new Date(),
    figures: [new Figure()],
  };
  const patches = getPatches(data, (data) => {
    data.users.push(newUser);
    data.usersCount++;
  });
  const copiedData = deepClone(data);
  applyPatches(copiedData, patches);
  expect(copiedData).toEqual<typeof data>({
    users: [...data.users, newUser],
    usersCount: 2,
  });

  const patches2 = getPatches(data, (data) => {
    data.users[0].birthday.setMinutes(10);
    data.users[0].figures[0].addProperty("color", "red");
  });
  const copiedData2 = deepClone(data);
  applyPatches(copiedData2, patches2);
  expect(copiedData2).toEqual<typeof data>({
    users: [
      {
        ...data.users[0],
        birthday: setMinutes(data.users[0].birthday, 10),
        figures: [new Figure().addProperty("color", "red")],
      },
    ],
    usersCount: 1,
  });
});
