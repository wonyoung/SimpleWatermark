'use strict';
import React, {
  Component,
  StyleSheet,
  View,
  Text
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
      <View style={{flexDirection:'row'}}>
        <Text style={styles.values}>{this.props.opacity.toFixed(2)}</Text>
        <Slider
          style={styles.slider}
          value={this.props.opacity}
          min={0}
          max={1}
          onChange={this.props.onChangeOpacity}/>
      </View>
    );
  }
}

export class ScaleControl extends Component {
  render() {
    return (
      <View style={{flexDirection:'row'}}>
        <Text style={styles.values}>{this.props.scale.toFixed(2)}</Text>
        <Slider
          style={styles.slider}
          value={this.props.scale}
          min={0}
          max={1}
          onChange={this.props.onChangeScale}/>
      </View>
    );
  }
}

export class AngleControl extends Component {
  render() {
    return (
      <View style={{flexDirection:'row'}}>
        <Text style={styles.values}>{this.props.angle}° </Text>
        <Slider
          style={styles.slider}
          value={this.props.angle}
          min={0}
          max={360}
          onChange={this.props.onChangeAngle}/>
      </View>
    );
  }
}

export class PaddingControl extends Component {
  render() {
    return (
      <View style={{flexDirection:'row'}}>
        <Text style={styles.values}>{this.props.padding}</Text>
        <Slider
          style={styles.slider}
          value={this.props.padding}
          min={0}
          max={0.5}
          onChange={this.props.onChangePadding}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slider: {
    flex: 9
  },
  values: {
    flex: 1,
    alignSelf: 'center',
    textAlign: 'right'
  }
});
