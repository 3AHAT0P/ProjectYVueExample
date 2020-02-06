import waitMacro from './waitMacro';

export default async (cb: () => any, time: number = 1) => {
  await waitMacro(time);
  await cb();
};
