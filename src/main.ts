import { applyPatches, getPatches } from "./utils";

const data = {
  users: [
    {
      name: "John",
      age: 20,
    },
    {
      name: "Jane",
      age: 21,
    },
  ],
  usersCount: 2,
};

const patches = getPatches(data, (data) => {
  data.users.push({ name: "Bob", age: 22 });
  data.usersCount = 3;
  data.users.shift();
  data.usersCount = 2;
});

console.log(patches, data);

const patchedData = applyPatches(data, patches);

console.log(patchedData, data);
