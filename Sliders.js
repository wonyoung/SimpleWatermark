'use strict';
import React, {
  Component,
  StyleSheet,
  View,
  Text,
  PanResponder
} from 'react-native';

import Slider from 'react-native-slider';

const sliderProps = {
  minimumTrackTintColor: '#AED581',
  thumbTintColor: '#7CB342'
}

export class OpacityControl extends Component {
  render() {
    return (
      <View style={{flexDirection:'row'}}>
        <Text style={styles.values}>{this.props.opacity.toFixed(2)}</Text>
        <Slider
          style={styles.slider}
          {...sliderProps}
          value={this.props.opacity}
          minimumValue={0}
          maximumValue={1}
          onValueChange={this.props.onChangeOpacity}/>
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
          {...sliderProps}
          value={this.props.scale}
          minimumValue={0}
          maximumValue={1}
          onValueChange={this.props.onChangeScale}/>
      </View>
    );
  }
}

export class AngleControl extends Component {
  render() {
    return (
      <View style={{flexDirection:'row'}}>
        <Text style={styles.values}>{parseInt(this.props.angle)}° </Text>
        <Slider
          style={styles.slider}
          {...sliderProps}
          progress={this.props.angle}
          minimumValue={0}
          maximumValue={360}
          onValueChange={this.props.onChangeAngle}/>
      </View>
    );
  }
}

export class PaddingControl extends Component {
  render() {
    return (
      <View >
        <View style={{flexDirection:'row'}}>
          <Text style={styles.values}>{this.props.xPadding.toFixed(2)}</Text>
          <Slider
            style={styles.slider}
            {...sliderProps}
            value={this.props.xPadding}
            minimumValue={0}
            maximumValue={1.0}
            onValueChange={(xPadding) =>
              this.props.onChangePadding(xPadding, this.props.yPadding)
            } />
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.values}>{this.props.yPadding.toFixed(2)}</Text>
          <Slider
            style={styles.slider}
            {...sliderProps}
            value={this.props.yPadding}
            minimumValue={0}
            maximumValue={1.0}
            onValueChange={(yPadding) =>
              this.props.onChangePadding(this.props.xPadding, yPadding)
            } />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slider_container: {
    position: "absolute",
  },
  slider: {
    flex: 6,
    marginHorizontal: 20
  },
  values: {
    flex: 1,
    alignSelf: 'center',
    textAlign: 'right',
    color: 'white'
  }
});
