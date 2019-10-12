const TYPE_YEAR = 'year';
const TYPE_MONTH = 'month';

export default class Graph {
  constructor(graphCanvas, CANVAS_WIDTH, CANVAS_HEIGHT, GRAPH_PADDING = 50) {
    this.CANVAS_WIDTH = CANVAS_WIDTH;
    this.CANVAS_HEIGHT = CANVAS_HEIGHT;
    this.GRAPH_PADDING = GRAPH_PADDING;
    this.coordinatesByYear = [];
    this.minY = 0;
    this.maxY = 0;
    this.start = 0;

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
    this.minY = min;
    this.maxY = max;
    this.start = start;

    const { coordinatesByYear, coordinatesByMonth }
      = this._convertToGraph(data, min, max, type === TYPE_MONTH);

    this.coordinatesByYear = coordinatesByYear;
    this._clearCanvas();
    this._drawCartesianCoordinateSystem(max, min, start, end);

    if (coordinatesByMonth.length > 0) {
      this._drawGraphByGroup(coordinatesByYear, 'red');
      this._drawGraph(coordinatesByMonth, 'rgba(52,43,95,0.52)');
    } else {
      this._drawGraph(coordinatesByYear, 'red');
      this._drawFluctuations(coordinatesByYear, '#ff000055', '#0000ff55');
    }
  }

  getInformation(x, y) {
    if (x < this.GRAPH_PADDING
      || x > this.CANVAS_WIDTH - this.GRAPH_PADDING
      || y < this.GRAPH_PADDING
      || y > this.CANVAS_HEIGHT - this.GRAPH_PADDING
    ) {
      return null;
    }

    const coefficientY = (this.CANVAS_HEIGHT - this.GRAPH_PADDING - y) / (this.CANVAS_HEIGHT - 2 * this.GRAPH_PADDING);
    const infoY = Math.round(coefficientY * (this.maxY - this.minY) + this.minY) / 100;

    let infoX = this.coordinatesByYear.length - 1;
    for (let i = 0; i < this.coordinatesByYear.length; ++i) {
      if (this.coordinatesByYear[i].x > x) {
        infoX = i - 1;
        break;
      }
    }

    return { infoY, infoX: this.start + infoX };
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
   * @param start
   * @param end
   * @private
   */
  _drawCartesianCoordinateSystem(max, min, start, end) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'grey';

    // y
    this.ctx.moveTo(this.GRAPH_PADDING, this.GRAPH_PADDING);
    this.ctx.lineTo(this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING);

    // x
    this.ctx.moveTo(this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING);
    this.ctx.lineTo(this.CANVAS_WIDTH - this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING);

    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = 'lightgrey';
    // x middle
    this.ctx.moveTo(this.GRAPH_PADDING, this.CANVAS_HEIGHT / 2);
    this.ctx.lineTo(this.CANVAS_WIDTH - this.GRAPH_PADDING, this.CANVAS_HEIGHT / 2);

    // text y
    this.ctx.font = '12px verdana';
    this.ctx.fillText(max / 100, 0, this.GRAPH_PADDING);
    this.ctx.fillText((max + min) / 200, 0, (this.CANVAS_HEIGHT) / 2);
    this.ctx.fillText(min / 100, 0, this.CANVAS_HEIGHT - this.GRAPH_PADDING);

    this.ctx.fillText(start, this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING + 24);
    this.ctx.fillText(end, this.CANVAS_WIDTH - this.GRAPH_PADDING, this.CANVAS_HEIGHT - this.GRAPH_PADDING + 24);

    this.ctx.stroke();
  }

  /**
   * Draw graph
   * @param {Array} coordinates
   * @param {string} color
   * @private
   */
  _drawGraph(coordinates, color) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.setLineDash([]);
    if (coordinates.length > 1) {
      this.ctx.moveTo(coordinates[0].x, coordinates[0].y);
      for (let i = 1; i < coordinates.length; ++i) {
        this.ctx.lineTo(coordinates[i].x, coordinates[i].y);
      }
    }
    this.ctx.stroke();
  }

  _drawGraphByGroup(coordinates, color) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.setLineDash([2, 3]);
    this.ctx.moveTo(coordinates[0].x, coordinates[0].y);
    let width = this.CANVAS_WIDTH - this.GRAPH_PADDING * 2;
    if (coordinates[1]) {
      width = coordinates[1].x - coordinates[0].x;
    }
    for (let i = 0; i < coordinates.length; ++i) {
      this.ctx.moveTo(coordinates[i].x, coordinates[i].y);
      this.ctx.lineTo(coordinates[i].x + width, coordinates[i].y);
    }
    this.ctx.stroke();
  }

  /**
   * Draw fluctuations
   * @param {Array} coordinates
   * @param {string} colorUp
   * @param {string} colorDown
   * @private
   */
  _drawFluctuations(coordinates, colorUp, colorDown) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = colorUp;
    for (let coordinate of coordinates) {
      this.ctx.moveTo(coordinate.x, coordinate.max);
      this.ctx.lineTo(coordinate.x, coordinate.y);
    }
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = colorDown;
    for (let coordinate of coordinates) {
      this.ctx.moveTo(coordinate.x, coordinate.min);
      this.ctx.lineTo(coordinate.x, coordinate.y);
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
        if (min > item.min) {
          min = item.min;
        }
        if (max < item.max) {
          max = item.max;
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
      coordinatesByYear.push(
        {
          x: this.GRAPH_PADDING + graphWidth * cursorYear / (dataLengthByYear - +!parseMonth),
          y: INVERT_VALUES_OF_Y - (yValue - min) / MaxMinDifference * graphHeight,
          min: INVERT_VALUES_OF_Y - (data[cursorYear].min - min) / MaxMinDifference * graphHeight,
          max: INVERT_VALUES_OF_Y - (data[cursorYear].max - min) / MaxMinDifference * graphHeight,
        },
      );

      // by month
      if (parseMonth) {
        for (let cursorMonth = 1; cursorMonth <= 12; ++cursorMonth) {
          const yValue = data[cursorYear].months[cursorMonth].v;
          const i = cursorYear * 11 + (cursorMonth - 1);
          coordinatesByMonth.push(
            {
              x: this.GRAPH_PADDING + graphWidth * i / dataLengthByMonth,
              y: INVERT_VALUES_OF_Y - (yValue - min) / MaxMinDifference * graphHeight,
            },
          );
        }
      }
    }

    return { coordinatesByMonth, coordinatesByYear };
  }
}
