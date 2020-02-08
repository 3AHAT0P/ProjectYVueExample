import { waitMacro, nextMacro } from '../delayers';

export interface IListener {
  (...args: any[]): void;
}

type ListenerMeta = [IListener, boolean];

export default class EventEmitter {
  private _prefix: string = null;
  private _events: Map<string, ListenerMeta[]> = new Map();

  private _buildEventName(eventName: string): string {
    if (this._prefix == null) return eventName;
    return `${this._prefix}::${eventName}`;
  }

  private _addListener(eventName: string, listenerMeta: ListenerMeta): void {
    const _eventName = this._buildEventName(eventName);
    if (!this._events.has(_eventName)) this._events.set(_eventName, []);
    this._events.get(_eventName).push(listenerMeta);
  }

  private _getListeners(eventName: string): ListenerMeta[] {
    const _eventName = this._buildEventName(eventName);
    return this._events.get(_eventName);
  }

  private _setListeners(eventName: string, listeners: ListenerMeta[]): void {
    const _eventName = this._buildEventName(eventName);
    this._events.set(_eventName, listeners);
  }

  constructor(prefix?: string) {
    if (prefix != null) this._prefix = prefix;
  }

  public on(eventName: string, listener: IListener, ctx: any = null): this {
    this._addListener(eventName, [listener.bind(ctx), false]);
    return this;
  }

  public once(eventName: string, listener: IListener, ctx: any = null): this {
    this._addListener(eventName, [listener.bind(ctx), true]);
    return this;
  }

  public emit(eventName: string, ...data: any[]): this {
    const listeners = this._getListeners(eventName);
    if (listeners == null || listeners.length === 0) return this;
    const newListeners: ListenerMeta[] = [];
    for (const [listener, once] of listeners) {
      nextMacro(listener.bind(null, ...data));
      if (!once) newListeners.push([listener, false]);
    }
    this._setListeners(eventName, newListeners);

    return this;
  }

  public async emitSync(eventName: string, ...data: any[]): Promise<this> {
    const listeners = this._getListeners(eventName);
    if (listeners == null || listeners.length === 0) return this;
    const newListeners: ListenerMeta[] = [];
    await waitMacro(1);
    const promises = [];
    for (const [listener, once] of listeners) {
      promises.push(listener(...data));
      if (!once) newListeners.push([listener, false]);
    }
    this._setListeners(eventName, newListeners);
    await Promise.all(promises);

    return this;
  }
}
