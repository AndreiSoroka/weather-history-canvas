import './styles/style.css';
import Graph from './modules/Graph.js';
import Store from './modules/Store.js';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;


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


async function init() {
  const app = new App(new Store, new Graph('graph', CANVAS_WIDTH, CANVAS_HEIGHT));
  app.drawGraph().then();
}

init().then();
