import waitMicro from './waitMicro';

export default async (cb: cb) => {
  await waitMicro();
  await cb();
};
