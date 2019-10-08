import './styles/style.css';
import App from './modules/App.js';
import Graph from './modules/Graph.js';
import Store from './modules/Store.js';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;
const START_YEAR = 1881;
const END_YEAR = 2006;

const $startYear = document.getElementById('startYear');
const $endYear = document.getElementById('endYear');
for (let year = START_YEAR; year <= END_YEAR; ++year) {
  $startYear.add(new Option(year, year));
  $endYear.add(new Option(year, year));
}

const defaultState = {
  startYear: START_YEAR,
  endYear: END_YEAR,
};

async function init() {
  const app = new App(new Store, new Graph('graph', CANVAS_WIDTH, CANVAS_HEIGHT), defaultState);
  app.state.connect($startYear, 'startYear');
  app.state.connect($endYear, 'endYear');
  app.state.on('range', ({ startYear, endYear }) => {
    app.drawGraph(startYear, endYear).then();
  });

  app.drawGraph(app.state.startYear, app.state.endYear).then();
}

init().then();
