const DEFAULT_PAGE = '/';
const NOT_FOUND_PAGE = '/not-found';

const defaultPages = {
  [NOT_FOUND_PAGE]: {
    name: 'Not found',
    isError: true,
    isDefault: true,
  },
  [DEFAULT_PAGE]: {
    name: 'Default page',
    isDefault: true,
  },
};

export default class Router {
  constructor({ pages, defaultPage = DEFAULT_PAGE }) {
    this.pages = { ...defaultPages, ...pages };
    this.defaultPage = defaultPage;

    const path = this._getPath();
    this.currentPage = this.pages[path] || this.pages[this.defaultPage];
    this.fnsChangePages = [];

    this._beforeEnter(path);
    window.onpopstate = (e) => this._handleOnpopstate(e);
  }

  onChangePage(fn) {
    this.fnsChangePages.push(fn);
  }

  push(path) {
    window.location.hash = `#${path}`;
  }

  _handleOnpopstate() {
    const path = this._getPath();
    return this._beforeEnter(path, () => {
      for (let fn of this.fnsChangePages) {
        fn(this.pages[path]);
      }
    });
  }

  _getPath() {
    return window.location.hash.replace('#', '');
  }

  _beforeEnter(path, next = () => true) {
    if (!path) {
      return this.push(this.defaultPage);
    } else if (!this.pages[path]) {
      return this.push(NOT_FOUND_PAGE);
    } else if (this.pages[path].redirect){
      return this.push(this.pages[path].redirect)
    }
    this.currentPage = this.pages[path];
    return next();
  }
}
