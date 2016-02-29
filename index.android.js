/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  PanResponder,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

import { pannable, rotatable, scalable } from 'react-native-gesture-recognizers';
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

class SimpleWatermark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watermark: {
        uri: 'https://facebook.github.io/react/img/logo_og.png',
        height: 200,
        width: 200
      },
      images: [{uri: 'https://facebook.github.io/react/img/logo_og.png'}]
    };
  }

  selectWatermark(response) {
    const LONG_EDGE = 250;
    const ratio = response.height / response.width;
    const h = (ratio > 1.0) ? LONG_EDGE:LONG_EDGE*ratio;
    const w = (ratio > 1.0) ? LONG_EDGE/ratio:LONG_EDGE;
    const height = response.isVertical ? h:w;
    const width = response.isVertical ? w:h;

    const watermark = {
      uri: response.uri,
      isStatic: true,
      height,
      width
    };
    const {images} = this.state;

    this.setState({ watermark, images });
  }

  selectPhoto(response) {
    const {watermark} = this.state;
    const images = (response.images) ? response.images.map((i)=>
      ({uri: i.uri, isStatic: true})):[{uri: response.uri, isStatic:true}];

    this.setState({ watermark, images });

  }

  launchImageLibrary(options, callback) {
    const defOption = {
      mediaType: 'photo',
      videoQuality: 'high',
      noData: true,
      multiple: true
    };
    ImagePickerManager.launchImageLibrary(Object.assign({}, defOption, options),
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.error) {
          console.log('ImagePickerManager Error: ', response.error);
          return;
        }

        callback.bind(this)(response);
      }
    );
  }

  render() {
    const BUTTON_SIZE = 40;
    const button_style = {
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: 'lightgreen',
      justifyContent:'center'
    }
    return (
      <View style={{borderWidth:2, borderColor:'red', flex:1} }  ref='rootView'>
        <WatermarkPreview {...this.state} />
        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', position:'relative'}} >
          <View style={button_style}>
            <Text
              onPress={()=>this.launchImageLibrary({multiple:true}, this.selectPhoto)}>  Select...  </Text>
          </View>
          <View style={button_style}>
            <Text
              onPress={()=>this.launchImageLibrary({multiple:false}, this.selectWatermark)}>  Watermark  </Text>
          </View>
        </View>
      </View>
    );
  }
}

class WatermarkPreview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      translateX: 0,
      translateY: 0,
      rotate: '0deg',
      scale: 1.0
    };
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
    const {height, width} = this.props.watermark;
    const {translateX, translateY, rotate, scale} = this.state;
    const transform = [
      {translateX},
      {translateY},
      {rotate},
      {scale}
    ];
    return (
      <View style={styles.container}>
        <Image
          source={this.props.images[0]}
          style={styles.preview}
          resizeMode='contain'
          overflow='visible'
          >
          <Text> x: {this.state.translateX}</Text>
          <Text> y: {this.state.translateY}</Text>
          <Text> rotate: {this.state.rotate}</Text>
          <Text> scale: {this.state.scale}</Text>

          <PannableImage
            source={this.props.watermark}
            style={{ height, width}}
            onPan={this.onPan.bind(this)}
            onScaleStart={this.onScaleStart.bind(this)}
            onScale={this.onScale.bind(this)}
            onRotateStart={this.onRotateStart.bind(this)}
            onRotate={this.onRotate.bind(this)}
            onRotateEnd={this.debugState.bind(this)}
            panDecoratorStyle={{transform}} />
        </Image>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 9,
    marginBottom: 0,
    flexWrap:'nowrap',
    borderWidth: 3,
    borderColor: 'yellow'
  },
  preview: {
    flex: 1
  }
});

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
