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

const DISPLAY_BLOCK = 'block';
const DISPLAY_NONE = 'none';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const EVENT_KEYDOWN = 'keydown';
const EVENT_CLICK = 'click';
const EVENT_RESIZE = 'resize';
const EVENT_LOAD = 'load';
const EVENT_MOUSEDOWN = 'mousedown';

const $graphInfoPointer = document.getElementById('graph-info-pointer');
const $graphInfoRange = document.getElementById('graph-info-range');
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
    $graphInfoPointer,
    $graphInfoRange,
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
      alert(errors.pageNotFound);
      router.push(TEMPERATURE_PAGE);
      return false;
    }
    return true;
  });

  $graph.addEventListener(EVENT_MOUSEDOWN, (event) => {
    app.showInformationInGraph(event.clientX, event.clientY);
  });

  app.state.connectEl($startYear, 'startYear');
  app.state.connectEl($endYear, 'endYear');
  app.state.on('range', ({ startYear, endYear, type }) => {
    $graphNavLeft.disabled = startYear <= START_YEAR;
    $graphNavRgiht.disabled = endYear >= END_YEAR;

    app.drawGraph(startYear, endYear, type)
      .catch(e => showError(errors.drawGraph, e));
  });

  $graphNavLeft.addEventListener(EVENT_CLICK, shiftRangeLeft);
  $graphNavRgiht.addEventListener(EVENT_CLICK, shiftRangeRight);

  window.addEventListener(EVENT_RESIZE, () => {
    app.showGraphInfoPointer(false);
  }, true);

  app.drawGraph(app.state.startYear, app.state.endYear, app.state.type)
    .catch(e => showError(errors.drawGraph, e));

  document.addEventListener(EVENT_KEYDOWN, (e) => {
    switch (e.code) {
      case KEY_ARROW_LEFT:
        shiftRangeLeft();
        break;
      case KEY_ARROW_RIGHT: {
        shiftRangeRight();
        break;
      }
    }
  });

  function shiftRangeRight() {
    if (app.state.range.endYear >= END_YEAR) {
      return;
    }
    app.state.range = { startYear: app.state.startYear + 1, endYear: app.state.endYear + 1 };
  }

  function shiftRangeLeft() {
    if (app.state.range.startYear <= START_YEAR) {
      return;
    }
    app.state.range = { startYear: app.state.startYear - 1, endYear: app.state.endYear - 1 };
  }

}

function showError(message, log) {
  console.error(log);

  if (!message) {
    $error.style.display = DISPLAY_NONE;
    return;
  }
  $error.style.display = DISPLAY_BLOCK;
  $error.innerText = message;
}

document.addEventListener(EVENT_LOAD, init().catch(e => showError(errors.app, e)));
