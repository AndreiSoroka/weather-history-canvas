import './styles/style.css';
import App from './modules/App.js';
import Graph from './modules/Graph.js';
import Store from './modules/Store.js';
import Router from './modules/Router.js';

const TEMPERATURE_PAGE = '/temperature';
const PRECIPITATION_PAGE = '/precipitation';
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;
const START_YEAR = 1881;
const END_YEAR = 2006;

const $graph = document.getElementById('graph');
const $graphInfo = document.getElementById('graph-info');
const $startYear = document.getElementById('startYear');
const $endYear = document.getElementById('endYear');
for (let year = START_YEAR; year <= END_YEAR; ++year) {
  $startYear.add(new Option(year, year));
  $endYear.add(new Option(year, year));
}

const defaultState = {
  startYear: START_YEAR,
  endYear: END_YEAR,
  type: 'temperature',
};


const pages = {
  '/': {
    redirect: TEMPERATURE_PAGE,
  },
  [TEMPERATURE_PAGE]: {
    type: 'temperature',
  },
  [PRECIPITATION_PAGE]: {
    type: 'precipitation',
  },
};

async function init() {
  const app = new App({
    store: new Store,
    graph: new Graph($graph, CANVAS_WIDTH, CANVAS_HEIGHT),
    graphInfo: $graphInfo,
    defaultState,
  });

  const router = new Router({ pages, defaultPage: TEMPERATURE_PAGE });
  if (router.currentPage.isError) {
    router.push(TEMPERATURE_PAGE);
  }

  app.state.connectRouter(router, 'type', (page) => {
    if (page.isError) {
      alert('page not found');
      router.push(TEMPERATURE_PAGE);
      return false;
    }
    return true;
  });

  $graph.addEventListener('mousedown', function (event) {
    const rect = $graph.getBoundingClientRect();
    const x = (CANVAS_WIDTH / rect.width) * (event.clientX - rect.left);
    const y = (CANVAS_HEIGHT / rect.height) * (event.clientY - rect.top);
    app.showInformationInGraph(x, y, event.clientX - rect.left, event.clientY - rect.top);
  });

  app.state.connectEl($startYear, 'startYear');
  app.state.connectEl($endYear, 'endYear');
  app.state.on('range', ({ startYear, endYear, type }) => {
    app.drawGraph(startYear, endYear, type).then();
  });

  app.drawGraph(app.state.startYear, app.state.endYear, app.state.type).then();
}

document.addEventListener('load', init().then());
