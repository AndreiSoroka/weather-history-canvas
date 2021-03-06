import Graph from './Graph.js';
import Store from './Store.js';

const DISPLAY_BLOCK = 'block';
const DISPLAY_NONE = 'none';

/**
 * Local state
 * @type {Object}
 */
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
    set({ startYear, endYear }) {
      if (startYear && this._startYear !== startYear) {
        this._startYear = startYear;
        this.emit('startYear', this._startYear);
      }
      if (endYear && this._endYear !== endYear) {
        this._endYear = endYear;
        this.emit('endYear', this._endYear);
      }
      this.emit('range', this.range);
    },
    get() {
      return {
        startYear: Math.min(this.startYear, this.endYear),
        endYear: Math.max(this.startYear, this.endYear),
        type: this.type,
      };
    },
  },

  emit: {
    /**
     * Submit change event
     * @param {string} key - variable in state
     * @param {*} value
     */
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
    /**
     * Tracking changes in state
     * @param {string} key - variable in state
     * @param {Function} fn - callback
     */
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

  connectEl: {
    /**
     * Connect DOM element and state
     * @param $el - DOM element
     * @param key - variable in state
     */
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

  connectRouter: {
    /**
     * Connect router and state
     * @param {Router} router
     * @param {string} key - variable in state
     * @param {Function} handle - callback
     */
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
  constructor({ defaultState, $graphInfoRange, $graphInfoPointer, $graph, $graphInfo, width = 500, height = 300 }) {
    this.state = state;
    this.$graph = $graph;
    this.$graphInfo = $graphInfo;
    this.$graphInfoRange = $graphInfoRange;
    this.$graphInfoPointer = $graphInfoPointer;
    this.store = new Store();
    this.graph = new Graph($graph, width, height);
    this._currentRangeData = [];
    this.width = width;
    this.height = height;

    for (let key in defaultState) {
      if (defaultState.hasOwnProperty(key) && state[key] === undefined) {
        this.state[key] = defaultState[key];
      }
    }
  }

  /**
   * Draw graph
   * @param {number} start - year
   * @param {number} end - year
   * @param {string} type
   * @returns {Promise<void>}
   */
  async drawGraph(start, end, type = 'temperature') {
    const range = end - start + 1;
    this.showGraphInfoPointer(false);
    this.showGraphInfo(false);
    if (range === 1) {
      this.$graphInfoRange.innerText = `Range: 1 year`;
    } else {
      this.$graphInfoRange.innerText = `Range: ${range} years`;
    }
    const logKey = `drawGraph ${start}-${end}, ${type}`;
    console.time(logKey);
    const { result } = await this.store.getData(start, end, type);
    this._currentRangeData = result;
    this.graph.draw(start, end, result);
    console.timeEnd(logKey);
  }

  /**
   * Show information in graph
   * @param {number} eventX - coordinate
   * @param {number} eventY - coordinate
   */
  showInformationInGraph(eventX, eventY) {
    const { x, y } = this._graphCoordinates({ eventX, eventY });
    const info = this.graph.getInformation(x, y);
    if (!info) {
      this.showGraphInfoPointer(false);
      this.showGraphInfo(false);
      return;
    }

    const { infoY, index } = info;
    const data = this._currentRangeData[index];

    this.showGraphInfo(true);
    this.$graphInfo.innerHTML = `<div>Year: ${data.year}</div>`
      + `<div>Average value: ${this.graph.formatValue(data.v)}</div>`
      + `<div>Max value: ${this.graph.formatValue(data.max)}</div>`
      + `<div>Min value: ${this.graph.formatValue(data.min)}</div>`;

    this.$graphInfoPointer.innerText = infoY;
    this.showGraphInfoPointer(true);
    const { localX, localY } = this._appCoordinates({ eventX, eventY });
    this.$graphInfoPointer.style.top = `${localY}px`;
    this.$graphInfoPointer.style.left = `${localX}px`;
  }

  /**
   * Change display for $graphInfoPointer
   * @param {boolean} val
   */
  showGraphInfoPointer(val) {
    this.$graphInfoPointer.style.display = val ? DISPLAY_BLOCK : DISPLAY_NONE;
  }

  /**
   * Change display for $graphInfo
   * @param {boolean} val
   */
  showGraphInfo(val) {
    this.$graphInfo.style.display = val ? DISPLAY_BLOCK : DISPLAY_NONE;
  }

  /**
   * Coordinates for canvas
   * @param {number} eventX
   * @param {number} eventY
   * @returns {{x: number, y: number}}
   * @private
   */
  _graphCoordinates({ eventX, eventY }) {
    const rect = this.$graph.getBoundingClientRect();
    return {
      x: (this.width / rect.width) * (eventX - rect.left),
      y: (this.height / rect.height) * (eventY - rect.top),
    };
  }

  /**
   * Coordinates for DOM
   * @param {number} eventX
   * @param {number} eventY
   * @returns {{localY: number, localX: number}}
   * @private
   */
  _appCoordinates({ eventX, eventY }) {
    const rect = this.$graph.getBoundingClientRect();
    return {
      localX: eventX - rect.left - this.$graphInfoPointer.scrollWidth / 2,
      localY: eventY - rect.top - this.$graphInfoPointer.scrollHeight,
    };
  }
}
