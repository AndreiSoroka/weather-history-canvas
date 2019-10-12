const state = {};
Object.defineProperties(state, {
  startYear: {
    set(value) {
      const startYear = parseInt(value);
      if (startYear !== this._startYear) {
        this._startYear = startYear;
        this.emit('startYear', this._startYear);
        this.emit('range', this.range);
      }
    },
    get() {
      return this._startYear;
    },
  },

  endYear: {
    set(value) {
      const endYear = parseInt(value);
      if (endYear !== this._endYear) {
        this._endYear = endYear;
        this.emit('endYear', this._endYear);
        this.emit('range', this.range);
      }
    },
    get() {
      return this._endYear;
    },
  },

  type: {
    set(value) {
      // validate
      if (!['temperature', 'precipitation'].includes(value)) {
        // todo
        return;
      }

      if (this._type !== value) {
        this._type = value;
        this.emit('type', this._type);
        this.emit('range', this.range);
      }
    },
    get() {
      return this._type;
    },
  },

  range: {
    get() {
      return {
        startYear: Math.min(this.startYear, this.endYear),
        endYear: Math.max(this.startYear, this.endYear),
        type: this.type,
      };
    },
  },

  /**
   *
   */
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

  /**
   *
   */
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

  /**
   *
   */
  connectEl: {
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

  /**
   *
   */
  connectRouter: {
    value(router, key, handle = () => true) {
      if (router.currentPage.type) {
        this.type = router.currentPage.type;
      }
      router.onChangePage(page => {
        console.log(page);
        if (!handle(page)) {
          return;
        }
        this.type = page.type;
      });
      this.on('type', (value) => {
        // todo
        router.push(`/${value}`);
      });
    },
  },
});

export default class App {
  constructor({ store, graph, defaultState, graphInfo }) {
    this.state = state;
    this.$graphInfo = graphInfo;

    for (let key in defaultState) {
      if (defaultState.hasOwnProperty(key) && state[key] === undefined) {
        this.state[key] = defaultState[key];
      }
    }

    this.store = store;
    this.graph = graph;
  }

  async drawGraph(start, end, type = 'temperature') {
    this.$graphInfo.style.display = 'none';
    const logKey = `drawGraph ${start}-${end}, ${type}`;
    console.time(logKey);
    const { result } = await this.store.getData(start, end, type);
    this.graph.draw(start, end, result);
    console.timeEnd(logKey);
  }

  showInformationInGraph(x, y, originalX, originalY) {
    const info = this.graph.getInformation(x, y);
    if (!info){
      this.$graphInfo.style.display = 'none';
      return;
    }
    this.$graphInfo.style.display = 'block';
    this.$graphInfo.innerHTML = `<div>Year: ${info.infoX}</div><div>Value: ${info.infoY}</div>`;

    this.$graphInfo.style.top = `${originalY - this.$graphInfo.clientHeight - 5}px`;
    this.$graphInfo.style.left = `${originalX - this.$graphInfo.clientWidth/2}px`;
  }
}
