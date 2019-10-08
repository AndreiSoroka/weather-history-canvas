import './styles/style.css';
import Graph from './modules/Graph.js';
import Store from './modules/Store.js';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;

const START_YEAR = 1881;
const END_YEAR = 2006;


class App {
  constructor(store, graph) {
    this.store = store;
    this.graph = graph;
  }

  async drawGraph(start = 1996, end = 2006, type = 'temperature') {
    if (type === 'temperature') {
      const { result } = await this.store.getTemperatureData(start, end);
      this.graph.draw(start, end, result);
    }
  }

}

const store = {
  _startYear: 1990,
  _endYear: 1991,
};

Object.defineProperties(store, {
  startYear: {
    set(value) {
      this._startYear = parseInt(value);
      this.emit('startYear', this._startYear);
      this.emit('range', this.range);
    },
    get() {
      return this._startYear || START_YEAR;
    },
  },
  endYear: {
    set(value) {
      this._endYear = parseInt(value);
      this.emit('endYear', this._endYear);
      this.emit('range', this.range);
    },
    get() {
      return this._endYear || END_YEAR;
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
  // connect:{
  //   value($el, key){
  //   }
  // }
});

window.store = store;

async function init() {
  const app = new App(new Store, new Graph('graph', CANVAS_WIDTH, CANVAS_HEIGHT));

  const $startYear = document.getElementById('startYear');
  const $endYear = document.getElementById('endYear');

  $startYear.addEventListener('change', (el) => {
    store.startYear = el.target.value;
  });

  $endYear.addEventListener('change', (el) => {
    store.endYear = el.target.value;
  });

  store.on('range', ({ startYear, endYear }) => {
    app.drawGraph(startYear, endYear).then();
  });

  for (let year = START_YEAR; year <= END_YEAR; ++year) {
    $startYear.add(new Option(year, year));
    $endYear.add(new Option(year, year));
  }

  $endYear.selectedIndex = $endYear.options.length - 1;
  app.drawGraph(store.startYear, store.endYear).then();
}

init().then();
