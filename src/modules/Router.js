const DEFAULT_PAGE = '/';
const NOT_FOUND_PAGE = '/not-found';

const DEFAULT_PAGES = {
  [NOT_FOUND_PAGE]: {
    name: 'Not found',
    isError: true,
    isDefault: true,
    title: 'Not found',
  },
  [DEFAULT_PAGE]: {
    name: 'Default page',
    isDefault: true,
    title: 'Default page',
  },
};

export default class Router {
  constructor({ pages, defaultPage = DEFAULT_PAGE, $title = null }) {
    this.$title = $title;
    this.pages = { ...DEFAULT_PAGES, ...pages };
    this.defaultPage = defaultPage;
    this.fnsChangePages = [];

    const path = this._getPath();
    this.currentPage = this.pages[path] || this.pages[this.defaultPage];

    this._beforeEnter(path);
    window.onpopstate = (e) => this._handleOnpopstate(e);
  }

  /**
   * Keep track of changing events
   * @param {Function} fn - callback function
   */
  onChangePage(fn) {
    this.fnsChangePages.push(fn);
  }

  /**
   * Change router
   * @param {string} path - router hash-path
   */
  push(path) {
    window.location.hash = `#${path}`;
  }

  /**
   * Handle to window.onpopstate
   * @returns {this._beforeEnter}
   * @private
   */
  _handleOnpopstate() {
    const path = this._getPath();
    return this._beforeEnter(path, () => {
      for (let fn of this.fnsChangePages) {
        fn(this.pages[path]);
      }
    });
  }

  /**
   * Get current router path
   * @returns {string}
   * @private
   */
  _getPath() {
    return window.location.hash.replace('#', '');
  }

  /**
   * Handler before each change to the router
   * @param {string} path - router hash-path
   * @param {Function} next - callback
   * @returns {next|void}
   * @private
   */
  _beforeEnter(path, next = () => true) {
    if (!path) {
      return this.push(this.defaultPage);
    } else if (!this.pages[path]) {
      return this.push(NOT_FOUND_PAGE);
    } else if (this.pages[path].redirect) {
      return this.push(this.pages[path].redirect);
    }
    this.currentPage = this.pages[path];
    if (this.$title) {
      this.$title.innerText = this.pages[path].title;
    }
    return next();
  }
}
