import EventEmitter, { IListener } from '../classes/EventEmitter';

import { updateInheritanceSequance, checkInheritanceSequance } from '../classHelpers';

const _eventEmitter = Symbol('_eventEmitter');

const CLASS_NAME = Symbol.for('Evented');

export const isEvented = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

export interface IEvented {
  on(eventName: string, listener: IListener, ctx?: any): this;
  once(eventName: string, listener: IListener, ctx?: any): this;
  emit(eventName: string, ...data: any[]): this;
  emitSync(eventName: string, ...data: any[]): Promise<this>;
}

type EventedConstructor = new () => IEvented;

/*
  @TODO Example
 */
const EventedMixin = <T>(BaseClass: T): T & EventedConstructor => {
  // eslint-disable-next-line no-use-before-define
  if (isEvented(BaseClass)) return BaseClass as any;

  // @ts-ignore
  class Evented extends BaseClass implements IEvented {
    private [_eventEmitter] = new EventEmitter();

    public on(eventName: string, listener: IListener, ctx: any = null): this {
      this[_eventEmitter].on(eventName, listener, ctx);
      return this;
    }

    public once(eventName: string, listener: IListener, ctx: any = null): this {
      this[_eventEmitter].once(eventName, listener, ctx);
      return this;
    }

    public emit(eventName: string, ...data: any[]): this {
      this[_eventEmitter].emit(eventName, ...data);
      return this;
    }

    public async emitSync(eventName: string, ...data: any[]): Promise<this> {
      await this[_eventEmitter].emitSync(eventName, ...data);
      return this;
    }
  }

  updateInheritanceSequance(Evented, BaseClass, CLASS_NAME);

  return Evented as any;
};

export default EventedMixin;

export const Evented = EventedMixin(Object);
