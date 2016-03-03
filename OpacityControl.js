'use strict';
import React, {
  Component
} from 'react-native';

import { MKSlider } from 'react-native-material-kit';

export default class OpacityControl extends Component {
  componentDidMount() {
    this.refs.slider.value = this.props.opacity;
  }

  render() {
    return (
      <MKSlider style={{flex:1}} ref='slider' min={0} max={1} onChange={this.props.onChangeOpacity}/>
    );
  }
}
