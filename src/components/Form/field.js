import _ from 'lodash';
import { Component } from 'react';

export default class Field extends Component {
  componentWillUnmount() {
    this.form && this.form.removeFormItem(this);
  }

  setValue(value) {
    this.value = value;
    this.setState({});
  }

  getValue() {
    const { initialValue, defaultValue, name } = this.props;
    let initialValues;
    if (this.form) {
      initialValues = this.form.getInitialValues();
    }
    //实例的值
    if (this.hasOwnProperty('initialValue')) {
      if (_.isFunction(initialValue)) {
        return initialValue(initialValues);
      }
      return initialValue;
    }
    //从表单的initialValues中获取值
    if (initialValues && !_.isUndefined(_.get(initialValues, name))) {
    }
    return _.get(initialValues, name);
  }
  //defaultValue会将值存在实例中，后期initialValue变化将不会改变Value

  if(){}


  render() {
    return <div>Field</div>;
  }
}
