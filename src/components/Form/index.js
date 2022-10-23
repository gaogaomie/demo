import { EventEmitter } from 'events';
import _ from 'lodash';
import { Component, createContext } from 'react';
import Item from './item';
const ConditionContext = new createContext();

export default class Form extends Component {
  static Context = ConditionContext;
  static Consumer = ConditionContext.Consumer;

  static Item = Item;
  static defaultProps = {
    paresValue: true, //默认开启值转换
  };
  event = new EventEmitter();
  formItems = [];
  addFormItem = (item) => {
    if (this.formItems.indexOf(item) < 0) {
      this.formItems.push(item);
      this.props.onFieldRemove && this.props.onFieldRemove();
      this.event.emit('fieldAdd', item);
    }
  };

  removeFormItem = (item) => {
    let i = this.formItems.indexOf(item);
    if (i >= 0) {
      this.formItems.splice(i, 1);
      this.props.onFieldRemove && this.props.onFieldRemove();
      this.event.emit('fieldRemove', item);
    }
  };

  getNames = () => {
    return this.formItems
      .map((v) => {
        return v.props.name;
      })
      .filter((v) => {
        return v;
      });
    //过滤undefined
  };

  getItemByName = (name) => {
    if (!name) {
      return;
    }
    return this.formItems.find((v) => {
      return v.props.name === name;
    });
  };

  validateFields = (nameList) => {
    let pList = [];
    let keys = this.getNames();
    if (nameList) {
      keys = nameList;
    }
    keys.map((v) => {
      pList.push(this.validate(v, 'onValidate'));
    });

    //除了error，应该还有warning等其他状态信息

    return Promise.all(pList).then((list) => {
      let values = {};
      let errors = [];
      list.map((v, i) => {
        if (!v.name) {
          return;
        }
        values[v.name] = v.value;
        //提取error的节点
        if (v.validateStatus.error) {
          errors.push({ [v.name]: v.validateStatus.errors });
        }
      });
      if (errors.length > 0) {
        return Promise.reject(errors);
      }
      return this.buildValues(values);
    });
  };

  validate = (name, type) => {
    let item = this.getItemByName(name);
    if (!item) {
      return Promise.resolve({ name });
    }
    return item.validate(type);
  };

  getControl = (item) => {
    const { onValuesChange } = this.props;
    const { name, valuePropName = 'value' } = item.props;
    this.addFormItem(item);
    return {
      updateValue: (val) => {
        //事件中获取值
        if (_.isObject(val) && _.has(val, `target.${valuePropName}`)) {
          val = _.get(val, `target.${valuePropName}`);
        }
        item.setValue(val);
        let values = this.getFieldsValue();
        if (name && onValuesChange) {
          onValuesChange({ [name]: val }, values);
        }
        this.event.emit('valueChange', { [name]: val }, values);
        this.validate(name);
      },
      [valuePropName]: item.getValue(),
    };
  };

  getInitialValues = () => {
    return this.props.initialValues;
  };

  //构建值信息
  buildValues(values) {
    let { paresValues } = this.props;
    let _values = {};
    Object.keys(values).forEach((name) => {
      let val = values[name];

      let item = this.getItemByName(name);
      if (item) {
        val = item.buildValue(val, values, _values);
      }
      if (parseValues) {
        _.set(values, name, val);
      } else {
        _values[name] = val;
      }

      return _values;
    });
  }

  getFieldsValue = (nameList) => {
    let keys = this.getNames();
    if (nameList) {
      keys = nameList;
    }
    let values = {};
    keys,
      forEach((v) => {
        values[v] = this.getFieldsValue(v);
      });
    return this.buildValues(values);
  };

  getFieldValue = (name) => {
    let item = this.getItemByName(name);
    if (!item) {
      return;
    }
    return item.getValue();
  };

  resetFields = (values) => {
    let val = values || this.props.initialValues || {};
    let rVal = {};

    this.getNames().forEach((v) => {
      rVal[v] = val[v];
    });
    this.setFieldValue(rVal);
  };

  setFieldValue(name, value) {
    let item = this.getItemByName(name);
    if (!item) {
      return;
    }
    return item.setValue(value);
  }

  setFieldsValue(values) {
    Object.keys(values || {}).forEach((v) => {
      this.setFieldValue(v, values[v]);
    });
  }

  submit = (e) => {
    const { onFinish, onSubmit } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (onSubmit) {
      return onSubmit();
    }
    return this.validateFields().then((values) => {
      onFinish && onFinish(values, e);
    });
  };

  render() {
    const {
      initialValues,
      onFieldAdd,
      onFieldRemove,
      onValuesChange,
      parseValues,
      onFinish,
      onSubmit,
      Component = 'form',
      ...props
    } = this.props;

    let child;
    if (Component === false) {
      child = props.children;
    } else {
      child = <Component onSubmit={this.submit} {...props} />;
    }

    return (
      <ConditionContext.Provider value={{ form: this }}>
        {child}
      </ConditionContext.Provider>
    );
  }
}
