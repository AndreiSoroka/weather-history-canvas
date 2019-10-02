export default class Graph {
  constructor(elementId, CANVAS_WIDTH, CANVAS_HEIGHT, GRAPH_PADDING = 50) {
    const graphCanvas = document.getElementById(elementId);
    this.CANVAS_WIDTH = CANVAS_WIDTH;
    this.CANVAS_HEIGHT = CANVAS_HEIGHT;
    this.GRAPH_PADDING = GRAPH_PADDING;
    if (graphCanvas.getContext) {
      this.ctx = graphCanvas.getContext('2d');
    } else {
      alert('Oyps...');
    }
  }

  /**
   * Draw canvas
   * @param dataY
   */
  draw(dataY) {
    const { min, max, coordinates } = this._convertToGraph(dataY);
    this._clearCanvas();
    this._drawCartesianCoordinateSystem(max, min);
    this._drawGraph(coordinates);
  }

  /**
   *
   * @private
   */
  _clearCanvas() {
    this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  }

  /**
   *
   * @param max
   * @param min
   * @private
   */
  _drawCartesianCoordinateSystem(max, min) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'grey';

    // y
    this.ctx.moveTo(this.GRAPH_PADDING, this.GRAPH_PADDING);
    this.ctx.lineTo(this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING);

    // x
    this.ctx.moveTo(this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING);
    this.ctx.lineTo(this.CANVAS_WIDTH - this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING);

    this.ctx.stroke();
  }

  /**
   * Draw graph
   * @param coordinates
   * @private
   */
  _drawGraph(coordinates) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';
    this.ctx.moveTo.apply(this.ctx, coordinates[0]);
    for (let i = 1; i < coordinates.length; ++i) {
      this.ctx.lineTo.apply(this.ctx, coordinates[i]);
    }
    this.ctx.stroke();
  }

  /**
   * Calculated graph coordinates and found min and max values
   * @param data
   * @returns {{min: number, max: number, coordinates: Array}}
   */
  _convertToGraph(data) {
    const coordinates = [];
    let min = Infinity;
    let max = -Infinity;

    // search min and max in graph
    for (let y of data) {
      if (min > y) {
        min = y;
      }
      if (max < y) {
        max = y;
      }
    }

    // calculate coordinates
    const MaxMinDifference = max - min;
    const dataLength = data.length - 1;

    const graphWidth = this.CANVAS_WIDTH - this.GRAPH_PADDING * 2;
    const graphHeight = this.CANVAS_HEIGHT - this.GRAPH_PADDING * 2;
    const INVERT_VALUES_OF_Y = this.GRAPH_PADDING + graphHeight;

    for (let i = 0; i <= dataLength; ++i) {
      const yValue = data[i];
      coordinates.push([
        this.GRAPH_PADDING + graphWidth * i / dataLength,
        INVERT_VALUES_OF_Y - (yValue - min) / MaxMinDifference * graphHeight,
      ]);
    }

    return { coordinates, min, max };
  }
}
