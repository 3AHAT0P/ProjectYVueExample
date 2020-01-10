import throttle from 'lodash/throttle';

export default (time: number = 500) => {
  return (target: any, key: string|symbol, descriptor: PropertyDescriptor) => {
    return {
      ...descriptor,
      value: throttle(descriptor.value, time),
    };
  };
};
