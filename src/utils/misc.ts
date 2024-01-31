import { webcrypto } from "crypto";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const uuidv4 = (includeDashes: boolean = true) => {
  const uuid = ([1e7].toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: string) => {
      const randomByte =
        webcrypto.getRandomValues(new Uint8Array(1))[0] &
        (15 >> (parseInt(c) / 4));
      return (parseInt(c) ^ randomByte).toString(16);
    }
  );

  return includeDashes ? uuid : uuid.replaceAll("-", "");
};

export const JSON_stringify = (
  input: any,
  replacer?: ((this: any, key: string, value: any) => any) | undefined,
  space?: string | number | undefined
): string | null => {
  try {
    return JSON.stringify(input, replacer, space);
  } catch (_) {
    return null;
  }
};

export const JSON_parse = (input: string): any | null => {
  try {
    return JSON.parse(input);
  } catch (_) {
    return null;
  }
};

export const dateToSeconds = (dateString: Date): number => {
  // Convert the date string to a Date object
  const dateObj = new Date(dateString);

  // Get the number of milliseconds since the Unix epoch (January 1, 1970)
  const milliseconds = dateObj.getTime();

  // Convert milliseconds to seconds by dividing by 1000
  const seconds = Math.floor(milliseconds / 1000);

  return seconds;
};
