import waitMacro from './waitMacro';

export default async (cb: cb) => {
  await waitMacro(1);
  await cb();
};
