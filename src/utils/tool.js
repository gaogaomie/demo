import React from 'react';

import _ from 'lodash';

import { history } from '@/components';

// Promise合并

let singleReqList = {};

const delayFuns = {};

class Tool {
  delayFun(id, fun, time) {
    clearTimeout(delayFuns[id]);

    delayFuns[id] = setTimeout(() => {
      fun();
    }, time || 500);
  }

  uuid() {
    return `${Date.now()}_${(Math.random() + '').slice(2)}`;
  }

  singleReq(id, req) {
    if (singleReqList[id]) {
      return singleReqList[id];
    }

    const p = req();

    singleReqList[id] = p;

    p.finally(() => {
      delete singleReqList[id];
    });

    return p;
  }

  //属性转换,对属性提取、属性配置、动态属性获取进行合并

  parseProps(props = {}) {
    const { propsMapName, getProps, ...restProps } = props;

    let propsMapInfo = {};

    let getPropsInfo = {};

    return Object.assign({});
  }

  //节点元素整理

  parseElements(elements, fun) {
    return React.Children.toArray(elements)

      .map((v) => {
        if (!v) {
          return;
        }

        return fun(v);
      })

      .filter((v) => {
        return v;
      });
  }

  //es6模板转换

  template(tmpl, data = {}) {
    let keys = Object.keys(data);

    let fun = new Function(...keys, 'return `' + tmpl + '`');

    let values = keys.map((k) => {
      return data[k];
    });

    try {
      return fun(...values);
    } catch (e) {
      return tmpl;
    }
  }

  //提供数据，可通过字符串或方法回调得到最终字符串

  getValue = (tmpl, data) => {
    if (typeof tmpl === 'string') {
      try {
        return this.template(tmpl, data);
      } catch (e) {
        console.error(e);

        return '';
      }
    }

    if (typeof tmpl === 'function') {
      return tmpl(data);
    }

    return tmpl;
  };

  isPromise(val) {
    return typeof val == 'object' && val.finally;
  }

  // 递归调用

  // data 要处理的数据

  // fun 单个数据处理方法,入参是单个数据

  // filter 是否继续,false则停止

  recursive(data, fun, filter = _.isArray, par) {
    if (_.isArray(data)) {
      return data.map((v) => {
        this.recursive(v, fun, filter, par);
      });
    }

    let val = fun(data, par);

    if (val && filter(val)) {
      return this.recursive(val, fun, filter, data);
    }

    return val;
  }

  mapTree(data, mapFun) {
    if (!data || !_.isArray(data)) {
      return;
    }

    return data.map((v, index) => {
      return mapFun(v, index, (children) => {
        return this.mapTree(children, mapFun);
      });
    });
  }

  jsonCopy(json) {
    try {
      let str = JSON.stringify(json);

      json = JSON.parse(str);
    } catch (e) {}

    return json;
  }

  parseJson(str) {
    if (!str) {
      return str;
    }

    if (_.isArray(str)) {
      return str.map((v) => {
        return this.parseJson(v);
      });
    }

    if (_.isObject(str)) {
      Object.keys(str).forEach((v) => {
        let val = this.parseJson(str[v]);

        if (val != str[v]) {
          str[v] = val;
        }
      });

      return str;
    }

    if (!_.isString(str)) {
      return str;
    }

    try {
      let json = JSON.parse(str);

      return this.parseJson(json);
    } catch (e) {
      return str;
    }
  }

  isJson(str) {
    if (!str) {
      return false;
    }

    try {
      let res = JSON.parse(str);

      if (typeof res !== 'object' || res === null) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  //json字符串整理

  parseJsonString(str) {
    if (!str) {
      return str;
    }

    let json = this.parseJson(str);

    try {
      return JSON.stringify(json, null, '\t');
    } catch (e) {
      return json;
    }
  }

  getLocalInfo(key, defaultValue) {
    try {
      let params = localStorage.getItem(key);

      if (params) {
        return JSON.parse(params);
      }
    } catch (e) {}

    return defaultValue;
  }

  setLocalInfo(key, value = {}) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // 数组去重

  arrayUnique(arr, fn) {
    if (arr.length < 2) {
      return arr;
    }

    if (typeof fn !== 'function') {
      fn = (a) => a;
    }

    const tmp = [];

    return arr.filter((v) => {
      const a = fn(v);

      if (tmp.indexOf(a) >= 0) {
        return false;
      }

      tmp.push(a);

      return true;
    });
  }

  //获取值的资源信息

  getSourceValue(value, source = [], conf = { valueKey: 'value' }) {
    const { valueKey } = conf;

    if (!_.isArray(value)) {
      return source.find((v) => {
        return v[valueKey] == value;
      });
    }

    return source.filter((v) => {
      return value.indexOf(v[valueKey]) >= 0;
    });
  }

  // 数组排序，safari浏览器排序有坑

  arraySort(arr, fn) {
    const _sort = Array.prototype.sort;

    if (!!fn && typeof fn === 'function') {
      if (arr.length < 2) return arr;

      let i = 0;

      let j = i + 1;

      const l = arr.length;

      let tmp;

      let r = false;

      let t = 0;

      for (; i < l; i++) {
        for (j = i + 1; j < l; j++) {
          t = fn.call(arr, arr[i], arr[j]);

          r = typeof t === 'number' && t > 0;

          if (r) {
            tmp = arr[i];

            arr[i] = arr[j];

            arr[j] = tmp;
          }
        }
      }

      return arr;
    }

    return _sort.call(arr);
  }

  getLastName(name = '') {
    let l = name.split('.');

    return l[l.length - 1];
  }

  //获取浮点型整数

  getFloatInt(number) {
    let str = (number || 0).toString();

    let v = str.split('.');

    return {
      value: parseInt(v.join('')),

      fixed: v.length == 2 ? v[1].length : 0,
    };
  }

  multiply(a, b) {
    let va = this.getFloatInt(a);

    let vb = this.getFloatInt(b);

    return (va.value * vb.value) / Math.pow(10, va.fixed + vb.fixed);
  }

  humanTimeSize(time) {
    if (!time) {
      return '';
    }

    let h = parseInt(time / 3600);

    let m = parseInt((time % 3600) / 60);

    let s = parseInt(time % 60);

    let v = [];

    h && v.push(`${h}小时`);

    m && v.push(`${m}分钟`);

    s && v.push(`${s}秒`);

    if (v.length > 0) {
      return v.join('');
    }

    return '';
  }

  //获取页面查询条件

  getLocationQuery(path) {
    const { location } = history;

    return _.get(location.query, path);
  }

  //更新页面查询条件

  updateLocationQuery(conf) {
    const { location } = history;

    let query = Object.assign({}, location.query, conf);

    return history.push({
      pathname: location.pathname,

      query,
    });
  }

  getLink = (tmpl) => {
    const { location } = history;

    return this.getValue(tmpl, location);
  };

  setList(conf = {}) {
    const { type, list, item, filter } = conf;

    let index = list.findIndex((v) => {
      if (filter) {
        return filter(item, v);
      }

      return item == v;
    });

    if (type == 'add' && index < 0) {
      list.push(item);
    }

    if (type == 'remove' && index >= 0) {
      list.splice(index, 1);
    }

    return list;
  }

  searchStr(str, query) {
    if (!query) {
      return false;
    }

    return str.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }

  highlightString(str, text, className = 'text-red text-bold') {
    if (!text) {
      return str;
    }

    let tList = [];

    let t = text.toLowerCase();

    let s = str.replace(new RegExp(t, 'ig'), (a) => {
      tList.push(a);

      return a.toLowerCase();
    });

    if (tList.length == 0) {
      return str;
    }

    let arr = s.split(t);

    let textArr = [];

    arr.forEach((v, i) => {
      textArr.push(v);

      if (tList[i]) {
        textArr.push(
          <span className={className} key={`${i}_${tList[i]}`}>
            {tList[i]}
          </span>,
        );
      }
    });

    return textArr;
  }

  offset(elem) {
    if (!elem || !elem.getClientRects().length) {
      return { top: 0, left: 0 };
    }

    let rect = elem.getBoundingClientRect();

    let win = elem.ownerDocument.defaultView;

    return {
      top: rect.top + win.pageYOffset,

      left: rect.left + win.pageXOffset,
    };
  }

  getElementTop(element) {
    if (!element) {
      return 0;
    }

    let actualTop = element.offsetTop;

    let current = element.offsetParent;

    while (current !== null) {
      actualTop += current.offsetTop;

      current = current.offsetParent;
    }

    return actualTop;
  }

  getElementLeft(element) {
    if (!element) {
      return 0;
    }

    let actualLeft = element.offsetLeft;

    let current = element.offsetParent;

    while (current !== null) {
      actualLeft += current.offsetLeft;

      current = current.offsetParent;
    }

    return actualLeft;
  }

  getScrollParent(node) {
    if (node == null) {
      return window;
    }

    const overflow = window.getComputedStyle(node).overflowY;

    if (overflow === 'auto' || overflow === 'scroll') {
      return node;
    }

    return this.getScrollParent(node.parentNode);
  }

  parseWorkId(id) {
    return (id || '').replace(/(^0*)/g, '');
  }

  pad(num, n) {
    let l = ('' + num).length;

    return Array(n > l ? n - l + 1 : 0).join(0) + num;
  }

  pipeFun(data, ...fns) {
    let _data = data;

    fns.forEach((v) => {
      if (_.isFunction(v)) {
        _data = v(_data);
      }
    });

    return _data;
  }
}

export default new Tool();
