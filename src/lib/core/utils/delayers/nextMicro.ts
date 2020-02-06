import waitMicro from './waitMicro';

export default async (cb: () => any) => {
  await waitMicro();
  await cb();
};
