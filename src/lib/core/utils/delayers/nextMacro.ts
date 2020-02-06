import waitMacro from './waitMacro';

export default async (cb: () => any) => {
  await waitMacro(1);
  await cb();
};
