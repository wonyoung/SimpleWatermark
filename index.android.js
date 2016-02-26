/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  PanResponder,
  Text,
  Image,
  View
} from 'react-native';

import { pannable } from 'react-native-gesture-recognizers';
import rotatable from './rotatable.js';
import scalable from './scalable.js';
const { ImagePickerManager } = React.NativeModules;

@rotatable
@scalable
@pannable ({ setGestureState: false })
class PannableImage extends Component {
  render() {
    return (
      <Image source={this.props.source} style={this.props.style}/>
    );
  }
}

const options = {
  mediaType: 'photo',
  videoQuality: 'high',
  noData: true,
  multiple: true
};

class SimpleWatermark extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      translateX: 0,
      translateY: 0,
      rotate: '0deg',
      scale: 1.0,
      imagesource: {uri: 'https://facebook.github.io/react/img/logo_og.png'},
      height: 100,
      width: 100
    };
    this.launchImageLibrary();
  }

  launchImageLibrary() {
    ImagePickerManager.launchImageLibrary(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        const LONG_EDGE = 250;
        const source = {uri: response.uri, isStatic: true};
        const ratio = response.height / response.width;
        const h = (ratio > 1.0) ? LONG_EDGE:LONG_EDGE*ratio;
        const w = (ratio > 1.0) ? LONG_EDGE/ratio:LONG_EDGE;
        const height = response.isVertical ? h:w;
        const width = response.isVertical ? w:h;

        this.setState(Object.assign({}, this.state, {
          imagesource: source,
          height,
          width
        }));
        console.log(this.state)
      }
    });
  }

  onPan({ absoluteChangeX, absoluteChangeY }) {
    this.setState(Object.assign({}, this.state, {
      translateX: absoluteChangeX,
      translateY: absoluteChangeY
    }));
  }

  onScaleStart() {
    this.scale0 = this.state.scale;
  }

  onScale(scale) {
    this.setState(Object.assign({}, this.state, {
      scale: this.scale0*scale,
    }));
  }

  onRotateStart() {
    this.rotate0 = parseInt(this.state.rotate);
  }

  onRotate(deg) {
    const d = (this.rotate0 - parseInt(deg) + 360) % 360;

    this.setState(Object.assign({}, this.state, {
      rotate: d+'deg',
    }));
  }

  debugState() {
    console.log(this.state);
  }

  render() {
    const {translateX, translateY, rotate, scale, height, width } = this.state;
    const transform = [
      {translateX},
      {translateY},
      {rotate},
      {scale}
    ];
    return (
      <View>
        <Text> x: {this.state.translateX}</Text>
        <Text> y: {this.state.translateY}</Text>
        <Text> rotate: {this.state.rotate}</Text>
        <Text> scale: {this.state.scale}</Text>
        <PannableImage
          source={this.state.imagesource}
          style={{ height, width}}
          onPan={this.onPan.bind(this)}
          onScaleStart={this.onScaleStart.bind(this)}
          onScale={this.onScale.bind(this)}
          onRotateStart={this.onRotateStart.bind(this)}
          onRotate={this.onRotate.bind(this)}
          onRotateEnd={this.debugState.bind(this)}
          panDecoratorStyle={{transform}} />
      </View>
    );
  }
}

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
