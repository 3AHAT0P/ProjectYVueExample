import waitMacro from './waitMacro';

export default async (cb: cb, time: number = 1) => {
  await waitMacro(time);
  await cb();
};
