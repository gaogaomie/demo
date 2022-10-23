import { Component } from 'react';

// component功能补充,提供setState防错，事件绑定功能
export default class BaseComponent extends Component {
  state = {};
  componentDidMount() {
    this.didMount && this.didMount();
  }
  componentDidUpdate() {
    this.didUpdate && this.didUpdate();
  }
  componentWillUnmount() {
    this.unmounted = true;
    this.willUnmount && this.willUnmount();
    this.unbindAll();
  }

  // setState 补充，防止异步调用造成报错
  setState(data, cbkFun) {
    if (this.unmounted) {
      return;
    }
    return super.setState(data || {}, cbkFun);
  }

  baseComponentBindEvents = [];

  // 事件绑定，包含原生html事件
  bind(server, name, fun, useCapture) {
    // 可为一个回调方法绑定多个事件名
    if (name instanceof Array) {
      return name.forEach((v) => {
        this.bind(server, v, fun, useCapture);
      });
    }
    // 存储绑定事件信息，卸载时使用
    this.baseComponentBindEvents.push({
      server,
      name,
      fun,
    });
    if (server.addEventListener) {
      server.addEventListener(name, fun, useCapture);
    } else {
      server.on(name, fun);
    }
  }

  // 卸载所有绑定事件
  unbindAll() {
    this.baseComponentBindEvents.forEach((v) => {
      if (v.server.addEventListener) {
        v.server.removeEventListener(v.name, v.fun);
      } else {
        v.server.off(v.name, v.fun);
      }
    });
  }

  // 卸载绑定事件
  unbind(server, name) {
    this.baseComponentBindEvents.forEach((v) => {
      if ((v.server === server, v.name === name)) {
        if (v.server.addEventListener) {
          v.server.removeEventListener(v.name, v.fun);
        } else {
          v.server.off(v.name, v.fun);
        }
      }
    });
  }
}
