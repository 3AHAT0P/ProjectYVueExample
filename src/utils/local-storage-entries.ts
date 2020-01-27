export default function* localStorageEntries() {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    const value = localStorage.getItem(key);
    yield [key, value];
  }
}
