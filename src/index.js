import './styles/style.css';
import Graph from './modules/Graph.js';
// import Store from './modules/Store.js';

async function init() {
    const temperature = await import("./serverMocData/temperature.json");
    console.log(temperature)
}
init().then();

const dataY = [
  25, 20, 30, 20, 15, 25, 20, 20, 25, 26, 20, 27, 30, 41, 34, 37, 30, 40, 31, 29, 27, 25,
];

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;


const graph = new Graph('graph', CANVAS_WIDTH, CANVAS_HEIGHT);
graph.draw(dataY);
