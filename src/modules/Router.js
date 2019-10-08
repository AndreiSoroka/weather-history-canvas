const DEFAULT = '/';
const NOT_FOUND = '/not-found';

const defaultPages = {
  [NOT_FOUND]: {
    name: 'Not found',
    isError: true,
    isDefault: true
  },
  [DEFAULT]: {
    name: 'Default page',
    isDefault: true
  },
};

export default class Router {
  constructor(pages) {
    this.pages = { ...defaultPages, ...pages };
    this.fnsChangePages = [];

    this.beforeEnter(this._getPath());
    window.onpopstate = (e) => this._handleOnpopstate(e);
  }

  onChangePage(fn) {
    this.fnsChangePages.push(fn);
  }

  _handleOnpopstate() {
    const path = this._getPath();
    return this.beforeEnter(path, ()=>{
      for (let fn of this.fnsChangePages) {
        fn(this.pages[path]);
      }
    });
  }

  _getPath() {
    return window.location.hash.replace('#', '');
  }

  beforeEnter(path, next = () => true) {
    if (!path) {
      window.location.hash = `#${DEFAULT}`;
      return;
    } else if (!this.pages[path]) {
      window.location.hash = `#${NOT_FOUND}`;
      return;
    }
    return next();
  }
}
