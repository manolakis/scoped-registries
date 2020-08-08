export class HTMLCollection {
  constructor(arr) {
    arr.forEach((item, index) => {
      this[index] = item;
    });

    this._length = arr.length;

    return Object.freeze(this);
  }

  get length() {
    return this._length;
  }

  item(index) {
    return this[index] != null ? this[index] : null;
  }

  namedItem(name) {
    for (let index = 0; index < this.length; index += 1) {
      console.log(this[index].name);
      if (
        this[index].id === name ||
        this[index].getAttribute('name') === name
      ) {
        return this[index];
      }
    }

    return null;
  }
}
