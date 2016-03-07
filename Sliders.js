'use strict';
import React, {
  Component,
  StyleSheet
} from 'react-native';

import { MKSlider } from 'react-native-material-kit';

export default class Slider extends Component {
  componentDidMount() {
    this.refs.slider.value = this.props.value;
  }

  render() {
    const {
      value,
      ...props
    } = this.props;

    return (
      <MKSlider ref='slider' {...props} />
    );
  }
}

export class OpacityControl extends Component {
  render() {
    return (
      <Slider
        style={styles.slider}
        value={this.props.opacity}
        min={0}
        max={1}
        onChange={this.props.onChangeOpacity}/>
    );
  }
}

export class ScaleControl extends Component {
  render() {
    return (
      <Slider
        style={styles.slider}
        value={this.props.scale}
        min={0}
        max={1}
        onChange={this.props.onChangeScale}/>
    );
  }
}

export class AngleControl extends Component {
  render() {
    return (
      <Slider
        style={styles.slider}
        value={this.props.angle}
        min={0}
        max={360}
        onChange={this.props.onChangeAngle}/>
    );
  }
}

export class PaddingControl extends Component {
  render() {
    return (
      <Slider
        style={styles.slider}
        value={this.props.padding}
        min={0}
        max={0.5}
        onChange={this.props.onChangePadding}/>
    );
  }
}

const styles = StyleSheet.create({
  slider: {
    flex: 1
  }
});
