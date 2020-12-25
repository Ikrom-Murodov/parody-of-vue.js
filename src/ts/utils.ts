/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This function makes it possible to get data.
 * @example
 *  const user = {ikrom: {name: "Ikrom", surname: "Murodov", age: 19}};
 *  const result = getData('ikrom.name', user);
 *
 * @param {string} path - path to value
 * @param {{ [key: string]: any }} target - The object from which you want to receive data.
 * @returns {any}
 */
export default function getData(
  path: string,
  target: { [key: string]: any },
): any {
  if (path.includes('.')) {
    const keys = path.split('.');
    let value: { [key: string]: any } | null = null;
    keys.forEach((key: string) => {
      if (value) value = value[key];
      else value = target[key];
    });
    return value;
  }
  return target[path];
}
