import { waitMacro, nextMacro } from '../delayers';

interface IListener {
  (...args: any[]): void;
}

type ListenerMeta = [IListener, boolean];

export default class EventEmitter {
  _prefix: string = null;
  _events: Map<string, ListenerMeta[]> = new Map();

  _buildEventName(eventName: string): string {
    if (this._prefix == null) return eventName;
    return `${this._prefix}::${eventName}`;
  }

  _addListener(eventName: string, listenerMeta: ListenerMeta): void {
    const _eventName = this._buildEventName(eventName);
    if (!this._events.has(_eventName)) this._events.set(_eventName, []);
    this._events.get(_eventName).push(listenerMeta);
  }

  _getListeners(eventName: string): ListenerMeta[] {
    const _eventName = this._buildEventName(eventName);
    return this._events.get(_eventName);
  }

  _setListeners(eventName: string, listeners: ListenerMeta[]): void {
    const _eventName = this._buildEventName(eventName);
    this._events.set(_eventName, listeners);
  }

  constructor(prefix: string) {
    if (prefix != null) this._prefix = prefix;
  }

  on(eventName: string, listener: IListener, ctx: any = null): this {
    this._addListener(eventName, [listener.bind(ctx), false]);
    return this;
  }

  once(eventName: string, listener: IListener, ctx: any = null): this {
    this._addListener(eventName, [listener.bind(ctx), true]);
    return this;
  }

  emit(eventName: string, ...data: any[]) {
    const listeners = this._getListeners(eventName);
    if (listeners == null || listeners.length === 0) return;
    const newListeners: ListenerMeta[] = [];
    for (const [listener, once] of listeners) {
      nextMacro(listener.bind(null, ...data));
      if (!once) newListeners.push([listener, false]);
    }
    this._setListeners(eventName, newListeners);
  }

  async emitSync(eventName: string, ...data: any[]) {
    const listeners = this._getListeners(eventName);
    if (listeners == null || listeners.length === 0) return;
    const newListeners: ListenerMeta[] = [];
    await waitMacro(1);
    const promises = [];
    for (const [listener, once] of listeners) {
      promises.push(listener(...data));
      if (!once) newListeners.push([listener, false]);
    }
    this._setListeners(eventName, newListeners);
    await Promise.all(promises);
  }
}
