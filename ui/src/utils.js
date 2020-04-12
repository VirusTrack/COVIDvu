/**
 * Group an array of objects into an object that is
 * grouped by key in object
 *
 * @param {*} key
 * @param {*} array
 */
export const groupByKey = (key, array) => array.reduce((obj, item) => {
  const objKey = item[key];
  obj[objKey] = item;
  return obj;
}, {});

/**
 * Calculate the rough size of object and return in bytes
 *
 * @param {*} object
 */
export function roughSizeOfObject(object) {
  const objectList = [];
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if
    (
      typeof value === 'object'
            && objectList.indexOf(value) === -1
    ) {
      objectList.push(value);

      for (const i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}

/**
 * Remove the exclamation point prior to region label which is used on backend data
 * to ensure it shows at top of list
 * 
 * @param {*} value 
 */
export const renderDisplay = (value) => (value.startsWith('!') ? value.substring(1) : value)
