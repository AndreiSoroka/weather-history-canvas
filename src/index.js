import './styles/style.css';
import Graph from './modules/Graph.js';
import Store from './modules/Store.js';

// const dataY = [
//   25, 20, 30, 20, 15, 25, 20, 20, 25, 26, 20, 27, 30, 41, 34, 37, 30, 40, 31, 29, 27, 25,
// ];

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;


class App {
  constructor(store, graph) {
    this.store = store;
    this.graph = graph;
  }

  drawGraph(start = 1881, end = 2006, type = 'temperature') {
    let data;
    if (type === 'temperature') {
      data = this.store.getTemperatureData(start, end);
      console.log(data);
    }
    // this.graph.draw(dataY);
  }


}


async function init() {
  const app = new App(new Store, new Graph('graph', CANVAS_WIDTH, CANVAS_HEIGHT));
  app.drawGraph();
}

init().then();
