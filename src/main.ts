import { getPatches } from "./utils";

class SomeStruct {
  map = new Map();

  set(key: string, value: string) {
    this.map.set(key, value);
  }
}

const data = {
  users: [
    {
      name: "John",
      age: 20,
      birthday: new Date(),
      tags: new Map(),
      struct: new SomeStruct(),
    },
    {
      name: "Jane",
      age: 21,
      birthday: new Date(),
      tags: new Map(),
      struct: new SomeStruct(),
    },
  ],
  usersCount: 2,
};

const patches = getPatches(data, (data) => {
  // console.log(data.users[0].struct.set);
  data.users.push({ name: "Bob", age: 22, birthday: new Date(), tags: new Map(), struct: new SomeStruct() });
  data.usersCount = 3;
  data.users[0].birthday.setMinutes(20);
  data.users[0].tags.set("foo", "bar");
  data.users[0].struct.map.set("foo", "bar");
  data.users[0].struct.set("foo2", "bar");
});

console.log(patches, data);
