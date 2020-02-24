export type boolOrCallbackToBool = boolean | ((options: any) => boolean);

export default class NonDeterminedStateMachine {
  private _state: string = null;
  private _availableStates: Set<string> = new Set();
  private _availableTransitions: Map<string, Hash<boolOrCallbackToBool>> = new Map();
  private _stateHistory: string[] = [];
  private _historyLimit = 10;

  private _addToHistory(state: string) {
    this._stateHistory.push(state);
    if (this._stateHistory.length > this._historyLimit) this._stateHistory.shift();
  }

  constructor(states: Set<string>, transitions: Map<string, Hash<boolOrCallbackToBool>>) {
    this._availableStates = states;
    this._availableTransitions = transitions;
  }

  public getState(offset: number = 0): string {
    return this._stateHistory[this._stateHistory.length - 1 + offset];
  }

  public getTransition(prevState: string, nextState: string): boolOrCallbackToBool {
    if (prevState == null) return true;
    return this._availableTransitions.get(prevState)[nextState];
  }

  public makeTransition(nextState: string, options?: any): boolean {
    const canTransition = this.getTransition(this._state, nextState);
    if (canTransition instanceof Function) {
      if (canTransition(options)) {
        this._state = nextState;
        this._addToHistory(this._state);
        return true;
      }
    } else if (canTransition) {
      this._state = nextState;
      this._addToHistory(this._state);
      return true;
    }
    return false;
  }
}
