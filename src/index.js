import './styles/style.css';
import App from './modules/App.js';
import Router from './modules/Router.js';
import errors from './errors.json';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';

if (process.env.NODE_ENV === 'production') {
  OfflinePluginRuntime.install();
}

const TEMPERATURE_PAGE = '/temperature';
const PRECIPITATION_PAGE = '/precipitation';
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;
const START_YEAR = 1881;
const END_YEAR = 2006;

const $graphNavLeft = document.getElementById('graph-nav-left');
const $graphNavRgiht = document.getElementById('graph-nav-right');
const $error = document.getElementById('error');
const $graph = document.getElementById('graph');
const $title = document.getElementById('title');
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
    title: 'Temperature',
  },
  [PRECIPITATION_PAGE]: {
    type: 'precipitation',
    title: 'Precipitation',
  },
};

async function init() {
  const app = new App({
    $graph,
    $graphInfo,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    defaultState,
  });

  const router = new Router({ pages, defaultPage: TEMPERATURE_PAGE, $title });
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
    $graphNavLeft.disabled = app.state.startYear <= START_YEAR;
    $graphNavRgiht.disabled = app.state.endYear >= END_YEAR;

    app.drawGraph(startYear, endYear, type)
      .catch(e => showError(errors.drawGraph, e));
  });

  $graphNavLeft.addEventListener('click', shiftRangeLeft);
  $graphNavRgiht.addEventListener('click', shiftRangeRight);


  app.drawGraph(app.state.startYear, app.state.endYear, app.state.type)
    .catch(e => showError(errors.drawGraph, e));

  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case'ArrowLeft':
        shiftRangeLeft();
        break;
      case 'ArrowRight': {
        shiftRangeRight();
        break;
      }
    }
  });

  function shiftRangeRight() {
    if (app.state.endYear >= END_YEAR) {
      return;
    }
    app.state.range = { startYear: app.state.startYear + 1, endYear: app.state.endYear + 1 };
  }

  function shiftRangeLeft() {
    if (app.state.startYear <= START_YEAR) {
      return;
    }
    app.state.range = { startYear: app.state.startYear - 1, endYear: app.state.endYear - 1 };
  }

}

function showError(message, log) {
  console.error(log);

  if (!message) {
    $error.style.display = 'none';
    return;
  }
  $error.style.display = 'block';
  $error.innerText = message;
}

document.addEventListener('load', init().catch(e => showError(errors.app, e)));
