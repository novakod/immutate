import { test, expect } from "vitest";
import { Patch, getPatches } from "../";
import { setHours, setMinutes } from "date-fns";

test("Тестирование функции getPatches на простых данных", () => {
  const data = {
    tags: ["first", "second"],
    count: 2,
  };

  expect(getPatches(data, () => {})).toEqual<[Patch[], Patch[]]>([[], []]);

  expect(
    getPatches(data, (data) => {
      data.count = 4;
    })
  ).toEqual<[Patch[], Patch[]]>([
    [
      {
        type: "update",
        path: ["count"],
        previousValue: 2,
        nextValue: 4,
      },
    ],
    [
      {
        type: "update",
        path: ["count"],
        previousValue: 4,
        nextValue: 2,
      },
    ],
  ]);

  expect(
    getPatches(data, (data) => {
      data.tags.push("third");
    })
  ).toEqual<[Patch[], Patch[]]>([
    [
      {
        type: "add",
        path: ["tags", "2"],
        previousValue: undefined,
        nextValue: "third",
      },
    ],
    [
      {
        type: "remove",
        path: ["tags", "2"],
        previousValue: "third",
        nextValue: undefined,
      },
    ],
  ]);

  expect(
    getPatches(data, (data) => {
      data.tags.push("third");
      data.count = 3;
      data.tags.shift();
      data.count = 2;
    })
  ).toEqual<[Patch[], Patch[]]>([
    [
      {
        type: "add",
        path: ["tags", "2"],
        previousValue: undefined,
        nextValue: "third",
      },
      {
        type: "update",
        path: ["count"],
        previousValue: 2,
        nextValue: 3,
      },
      {
        type: "update",
        path: ["tags", "0"],
        previousValue: "first",
        nextValue: "second",
      },
      {
        type: "update",
        path: ["tags", "1"],
        previousValue: "second",
        nextValue: "third",
      },
      {
        type: "remove",
        path: ["tags", "2"],
        previousValue: "third",
        nextValue: undefined,
      },
      {
        type: "update",
        path: ["count"],
        previousValue: 3,
        nextValue: 2,
      },
    ],
    [
      {
        type: "remove",
        path: ["tags", "2"],
        previousValue: "third",
        nextValue: undefined,
      },
      {
        type: "update",
        path: ["count"],
        previousValue: 3,
        nextValue: 2,
      },
      {
        type: "update",
        path: ["tags", "0"],
        previousValue: "second",
        nextValue: "first",
      },
      {
        type: "update",
        path: ["tags", "1"],
        previousValue: "third",
        nextValue: "second",
      },
      {
        type: "add",
        path: ["tags", "2"],
        previousValue: undefined,
        nextValue: "third",
      },
      {
        type: "update",
        path: ["count"],
        previousValue: 2,
        nextValue: 3,
      },
    ],
  ]);
});

test("Тестирование функции getPatches на нетривиальных данных", () => {
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

  expect(getPatches(data, (data) => {})).toEqual<[Patch[], Patch[]]>([[], []]);

  const newUser = {
    id: 2,
    name: "Руслан",
    birthday: new Date(),
    figures: [],
  };

  expect(
    getPatches(data, (data) => {
      data.users.push(newUser);
      data.usersCount = 2;
    })
  ).toEqual<[Patch[], Patch[]]>([
    [
      {
        type: "add",
        path: ["users", "1"],
        previousValue: undefined,
        nextValue: newUser,
      },
      {
        type: "update",
        path: ["usersCount"],
        previousValue: 1,
        nextValue: 2,
      },
    ],
    [
      {
        type: "remove",
        path: ["users", "1"],
        previousValue: newUser,
        nextValue: undefined,
      },
      {
        type: "update",
        path: ["usersCount"],
        previousValue: 2,
        nextValue: 1,
      },
    ],
  ]);

  const newFigure = new Figure();
  expect(
    getPatches(data, (data) => {
      data.users[0].figures.push(newFigure);
      data.users[0].figures[0].addProperty("width", 100);
      data.users[0].figures[0].addProperty("height", 100);
      data.users[0].figures[0].propertiesMap.set("radius", 50);

      data.users[0].birthday.setMinutes(10);
      data.users[0].birthday.setHours(1);
    })
  ).toEqual<[Patch[], Patch[]]>([
    [
      {
        type: "add",
        path: ["users", "0", "figures", "1"],
        previousValue: undefined,
        nextValue: newFigure,
      },
      {
        type: "update",
        path: ["users", "0", "figures", "0"],
        previousValue: data.users[0].figures[0],
        nextValue: new Figure().addProperty("width", 100),
      },
      {
        type: "update",
        path: ["users", "0", "figures", "0"],
        previousValue: new Figure().addProperty("width", 100),
        nextValue: new Figure().addProperty("width", 100).addProperty("height", 100),
      },
      {
        type: "update",
        path: ["users", "0", "figures", "0", "propertiesMap"],
        previousValue: new Map().set("width", 100).set("height", 100),
        nextValue: new Map().set("width", 100).set("height", 100).set("radius", 50),
      },
      {
        type: "update",
        path: ["users", "0", "birthday"],
        previousValue: data.users[0].birthday,
        nextValue: setMinutes(data.users[0].birthday, 10),
      },
      {
        type: "update",
        path: ["users", "0", "birthday"],
        previousValue: setMinutes(data.users[0].birthday, 10),
        nextValue: setHours(setMinutes(data.users[0].birthday, 10), 1),
      },
    ],
    [
      {
        type: "remove",
        path: ["users", "0", "figures", "1"],
        previousValue: newFigure,
        nextValue: undefined,
      },
      {
        type: "update",
        path: ["users", "0", "figures", "0"],
        previousValue: new Figure().addProperty("width", 100),
        nextValue: data.users[0].figures[0],
      },
      {
        type: "update",
        path: ["users", "0", "figures", "0"],
        previousValue: new Figure().addProperty("width", 100).addProperty("height", 100),
        nextValue: new Figure().addProperty("width", 100),
      },
      {
        type: "update",
        path: ["users", "0", "figures", "0", "propertiesMap"],
        previousValue: new Map().set("width", 100).set("height", 100).set("radius", 50),
        nextValue: new Map().set("width", 100).set("height", 100),
      },
      {
        type: "update",
        path: ["users", "0", "birthday"],
        previousValue: setMinutes(data.users[0].birthday, 10),
        nextValue: data.users[0].birthday,
      },
      {
        type: "update",
        path: ["users", "0", "birthday"],
        previousValue: setHours(setMinutes(data.users[0].birthday, 10), 1),
        nextValue: setMinutes(data.users[0].birthday, 10),
      },
    ],
  ]);
});

test("Тестирование функции getPatches при изменении вложенных данных в уже изменённых данных", () => {
  const birthday = new Date();
  const data = {
    users: [
      {
        id: 1,
        name: "Мага",
        birthday,
      },
    ],
    usersCount: 1,
  };

  const patches = getPatches(data, (data) => {
    data.users.push({
      id: 2,
      name: "Руслан",
      birthday,
    });

    data.users[1].name = "Мага";
  });

  expect(patches).toEqual<[Patch[], Patch[]]>([
    [
      {
        type: "add",
        path: ["users", "1"],
        previousValue: undefined,
        nextValue: {
          id: 2,
          name: "Руслан",
          birthday,
        },
      },
      {
        type: "update",
        path: ["users", "1", "name"],
        previousValue: "Руслан",
        nextValue: "Мага",
      },
    ],
    [
      {
        type: "remove",
        path: ["users", "1"],
        previousValue: {
          id: 2,
          name: "Руслан",
          birthday,
        },
        nextValue: undefined,
      },
      {
        type: "update",
        path: ["users", "1", "name"],
        previousValue: "Мага",
        nextValue: "Руслан",
      },
    ],
  ]);
});
