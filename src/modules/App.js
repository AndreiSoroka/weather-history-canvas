const state = {};
Object.defineProperties(state, {
  startYear: {
    set(value) {
      this._startYear = parseInt(value);
      this.emit('startYear', this._startYear);
      this.emit('range', this.range);
    },
    get() {
      return this._startYear;
    },
  },
  endYear: {
    set(value) {
      this._endYear = parseInt(value);
      this.emit('endYear', this._endYear);
      this.emit('range', this.range);
    },
    get() {
      return this._endYear;
    },
  },
  range: {
    get() {
      return {
        startYear: Math.min(this.startYear, this.endYear),
        endYear: Math.max(this.startYear, this.endYear),
      };
    },
  },

  emit: {
    value(key, value) {
      if (!this._listeners || !this._listeners[key]) {
        return;
      }
      for (let fn of this._listeners[key]) {
        fn(value);
      }
    },
  },
  on: {
    value(key, fn) {
      if (!this._listeners) {
        this._listeners = {};
      }
      if (!this._listeners[key]) {
        this._listeners[key] = [];
      }
      this._listeners[key].push(fn);
    },
  },
  connect: {
    value($el, key) {
      $el.value = this[key].toString();
      $el.addEventListener('change', (el) => {
        state[key] = el.target.value;
      });
      this.on(key, (value) => {
        if ($el.value === value.toString()) {
          return;
        }
        $el.value = value.toString();
      });
    },
  },
});

export default class App {
  constructor({ store, graph, defaultState }) {
    this.state = state;

    for (let key in defaultState) {
      if (defaultState.hasOwnProperty(key) && state[key] === undefined) {
        this.state[key] = defaultState[key];
      }
    }

    this.store = store;
    this.graph = graph;
  }

  async drawGraph(start, end, type = 'temperature') {
    if (type === 'temperature') {
      const { result } = await this.store.getTemperatureData(start, end);
      this.graph.draw(start, end, result);
    }
  }
}
