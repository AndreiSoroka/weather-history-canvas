const NAME_TEMPERATURE = 'temperature';
const NAME_PRECIPITATION = 'precipitation';

export default class Store {
  constructor() {
    this.db = this._connectDB(window.indexedDB);
  }

  /**
   * Connect to indexedDB
   * @param idb
   * @returns {Promise}
   * @private
   */
  _connectDB(idb) {
    if (!idb) {
      return Promise.reject('Not supported indexedDB');
    }

    return new Promise((resolve, reject) => {
      const request = idb.open('weather', 1);

      request.onerror = reject;
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = function () {
          db.close();
          alert('DB is deprecated');
          location.reload();
        };
        return resolve(db);
      };
      request.onupgradeneeded = (e) => {
        e.currentTarget.result.createObjectStore(NAME_TEMPERATURE);
        e.currentTarget.result.createObjectStore(NAME_PRECIPITATION);
        return this._connectDB();
      };
    });
  }

  /**
   *
   * @param start
   * @param end
   * @param type
   * @returns {Promise<void>}
   */
  async getData(start, end, type) {
    // todo first load
    if (true) {
      await this._loadTemperatureDataFromServer(type);
    }

    return this._transactionFromHandle({
      name: type,
      fnHandle: objectStore => objectStore.getAll(IDBKeyRange.bound(start, end)),
    });
  }

  /**
   * Load temperature data from server
   * @returns {Promise<void>}
   * @private
   */
  async _loadTemperatureDataFromServer(type) {
    const data = await Store.loadingDataFromServer(type);
    await this._transactionFromHandle({
      name: type,
      type: 'readwrite',
      fnHandle: objectStore => {
        let cursor = 0;

        let cursorStartByYear = 0;
        let currentYear = 0;
        let commonDataByYears = 0;

        let months = {};
        let cursorStartByMonth = 0;
        let currentMonth = 0;
        let commonDataByMonth = 0;

        while (data[cursor]) {
          const item = data[cursor];
          const [year, month] = item.t.split('-').map(i => +i);

          if (currentMonth !== month) {
            if (currentMonth) {
              saveDataByMonth();
            }

            commonDataByYears += commonDataByMonth;
            if (currentYear !== year) {
              if (currentYear) {
                saveDataByYear();
                months = {};
              }

              commonDataByYears = 0;
              currentYear = year;
              cursorStartByYear = cursor;
            }

            cursorStartByMonth = cursor;
            commonDataByMonth = item.v;
            currentMonth = month;
          } else {
            commonDataByMonth += item['v'] * 100;
          }
          ++cursor;
        }
        saveDataByMonth();
        saveDataByYear();

        function saveDataByYear() {
          const v = Math.round(commonDataByYears / (cursor - cursorStartByYear));
          objectStore.put({ v, months, year: currentYear }, currentYear);
        }

        function saveDataByMonth() {
          months[currentMonth] = { v: Math.round(commonDataByMonth / (cursor - cursorStartByMonth)) };
        }
      },
    });
  }

  /**
   * Handler for multiple transaction
   * @param {String} name - table name
   * @param {Function} fnHandle - handler for transaction
   * @param {String} [type] - readonly/readwrite
   * @returns {Promise<*>}
   * @private
   */
  async _transactionFromHandle({ name, fnHandle, type = 'readonly' }) {
    const db = await this.db;
    const transaction = db.transaction(name, type);

    const objectStore = transaction.objectStore(name);
    const result = fnHandle(objectStore);
    return new Promise(resolve => {
      transaction.oncomplete = () => {
        resolve(result);
      };
    });
  };

  /**
   * Mock data from server (imitation query)
   * @param type
   * @returns {Promise<Array>}
   */
  static async loadingDataFromServer(type) {
    if (type === NAME_TEMPERATURE) {
      return import('../serverMocData/temperature.json');
    }
    if (type === NAME_PRECIPITATION) {
      return import('../serverMocData/precipitation.json');
    }

    return [];
  }
}
