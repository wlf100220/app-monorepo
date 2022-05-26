const list: string[] = [];

export const get = () => list.join('\n');

export const set = (...args: string[]) => {
  list.push(new Date().getTime().toString() + args.join(' '));
};
