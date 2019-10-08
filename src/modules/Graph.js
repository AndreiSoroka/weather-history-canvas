const TYPE_YEAR = 'year';
const TYPE_MONTH = 'month';

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
   * @param {number} start
   * @param {number} end
   * @param {Array} data
   */
  draw(start, end, data) {
    const type = data.length > 25 ? TYPE_YEAR : TYPE_MONTH;
    const { min, max } = this._findMinMaxInData(data, type);

    const { coordinatesByYear, coordinatesByMonth }
      = this._convertToGraph(data, min, max, type === TYPE_MONTH);

    console.log('coordinatesByYear', coordinatesByYear);
    console.log('coordinatesByMonth', coordinatesByMonth);
    this._clearCanvas();
    this._drawCartesianCoordinateSystem(max, min);
    this._drawGraph(coordinatesByYear, 'red');
    if (coordinatesByMonth.length > 0) {
      this._drawGraph(coordinatesByMonth, 'green');
    }
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
  _drawGraph(coordinates, color) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.moveTo.apply(this.ctx, coordinates[0]);
    for (let i = 1; i < coordinates.length; ++i) {
      this.ctx.lineTo.apply(this.ctx, coordinates[i]);
    }
    this.ctx.stroke();
  }

  /**
   * O(n)
   * @param data
   * @param type
   * @returns {{min: number, max: number}}
   * @private
   */
  _findMinMaxInData(data, type = TYPE_YEAR) {
    let min = Infinity;
    let max = -Infinity;

    if (type === TYPE_YEAR) {
      for (let item of data) {
        if (min > item.v) {
          min = item.v;
        }
        if (max < item.v) {
          max = item.v;
        }
      }
    } else if (type === TYPE_MONTH) {
      for (let item of data) {
        for (let i = 1; i <= 12; ++i) {
          if (min > item.months[i].v) {
            min = item.months[i].v;
          }
          if (max < item.months[i].v) {
            max = item.months[i].v;
          }
        }
      }
    }

    return { min, max };
  }

  /**
   * Calculated graph coordinates by month and year
   * O(n)
   * @param {Array} data
   * @param {number} min
   * @param {number} max
   * @param {boolean} parseMonth
   * @returns {{coordinatesByMonth: Array, coordinatesByYear: Array}}
   * @private
   */
  _convertToGraph(data, min, max, parseMonth) {
    const coordinatesByYear = [];
    const coordinatesByMonth = [];

    // calculate coordinates
    const MaxMinDifference = max - min;

    const dataLengthByYear = data.length;
    const dataLengthByMonth = (data.length) * 11;

    const graphWidth = this.CANVAS_WIDTH - this.GRAPH_PADDING * 2;
    const graphHeight = this.CANVAS_HEIGHT - this.GRAPH_PADDING * 2;
    const INVERT_VALUES_OF_Y = this.GRAPH_PADDING + graphHeight;

    for (let cursorYear = 0; cursorYear < dataLengthByYear; ++cursorYear) {
      // by year
      const yValue = data[cursorYear].v;
      coordinatesByYear.push([
        this.GRAPH_PADDING + graphWidth * cursorYear / (dataLengthByYear - 1),
        INVERT_VALUES_OF_Y - (yValue - min) / MaxMinDifference * graphHeight,
      ]);

      // by month
      if (parseMonth) {
        for (let cursorMonth = 1; cursorMonth <= 12; ++cursorMonth) {
          const yValue = data[cursorYear].months[cursorMonth].v;
          const i = cursorYear * 11 + (cursorMonth - 1);
          coordinatesByMonth.push([
            this.GRAPH_PADDING + graphWidth * i / dataLengthByMonth,
            INVERT_VALUES_OF_Y - (yValue - min) / MaxMinDifference * graphHeight,
          ]);
        }
      }
    }

    return { coordinatesByMonth, coordinatesByYear };
  }
}
