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
import {
  MKSlider,
  MKRadioButton
} from 'react-native-material-kit';
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
      images: [
        {
          uri: 'https://facebook.github.io/react/img/logo_og.png',
          height: 200, width: 200
        }
      ],
      opacity: 0.8
    };
  }

  selectWatermark(watermark) {
    this.setState({...this.state, watermark});
  }

  selectPhoto(image) {
    const images = (image.images) ? image.images:[image];
    this.setState({...this.state, images });
  }

  onOpacityChange(opacity) {
    this.setState({...this.state, opacity});
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
        <OpacityControl opacity={this.state.opacity} onChangeOpacity={this.onOpacityChange.bind(this)} />
        <PositionControl />
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

class OpacityControl extends Component {
  componentDidMount() {
    this.refs.slider.value = this.props.opacity;
  }

  render() {
    return (
      <MKSlider style={{flex:1}} ref='slider' min={0} max={1} onChange={this.props.onChangeOpacity}/>
    );
  }
}

class PositionControl extends Component {
  constructor(props) {
    super(props);
    this.radiogroup = new MKRadioButton.Group();
  }
  render() {
    return (
      <View style={{flex:2, flexDirection:'column'}}>
        <View style={{flex:1, flexDirection:'row'}}>
          <MKRadioButton checked={false} onCheckedChange={(e,i)=>{console.log(e,i)}} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={(e,i)=>{console.log(e,i)}} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={(e,i)=>{console.log(e,i)}} group={this.radiogroup}/>
        </View>
        <View style={{flex:1, flexDirection:'row'}}>
          <MKRadioButton checked={false} group={this.radiogroup}/>
          <MKRadioButton checked={false} group={this.radiogroup}/>
          <MKRadioButton checked={false} group={this.radiogroup}/>
        </View>
        <View style={{flex:1, flexDirection:'row'}}>
          <MKRadioButton checked={false} group={this.radiogroup}/>
          <MKRadioButton checked={false} group={this.radiogroup}/>
          <MKRadioButton checked={false} group={this.radiogroup}/>
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
      scale: 1.0,
      layout: {
        width: 200,
        height: 200
      },
    };
  }

  onPan({ absoluteChangeX, absoluteChangeY }) {
    this.setState({...this.state,
      translateX: absoluteChangeX,
      translateY: absoluteChangeY
    });
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

  _onLayout({nativeEvent: {layout}}) {
    const prev = this.state.layout;
    if (layout.width === prev.width && layout.height === prev.height) {
      return;
    }
    console.log(layout, this.state.layout, Object.is(layout, this.state.layout));
    this.setState({...this.state, layout})
  }

  imageWithAspectRatio(src) {
    const {height:layoutHeight, width:layoutWidth} = this.state.layout;

    const aspectRatio = src.isVertical ? src.width/src.height:src.height/src.width;
    const layoutAspectRatio = layoutWidth/layoutHeight;

    const width = (aspectRatio > layoutAspectRatio) ? layoutWidth:layoutHeight*aspectRatio;
    const height = (aspectRatio > layoutAspectRatio) ? layoutWidth/aspectRatio:layoutHeight;
    const top = (layoutHeight - height) / 2;
    const left = (layoutWidth - width) / 2;

    const uri = src.uri;
    return {
      uri, width, height, top, left
    };
  }

  render() {
    const bg = this.imageWithAspectRatio(this.props.images[0]);
    const bgsource = {uri:bg.uri};
    const {width, height, top, left} = bg;

    const wm = this.imageWithAspectRatio(this.props.watermark);
    const watermarkSource = {uri:wm.uri};
    const {width:wWidth, height:wHeight} = wm;

    const {translateX, translateY, rotate, scale} = this.state;
    const transform = [
      {translateX},
      {translateY},
      {rotate},
      {scale}
    ];

    return (
      <View
        style={styles.container}
        onLayout={this._onLayout.bind(this)}
        >
        <Image
          source={bgsource}
          style={[styles.preview, {height, width, top, left}]}
          >
          <PannableImage
            source={watermarkSource}
            style={{height: wHeight, width: wWidth, opacity:this.props.opacity}}
            onPan={this.onPan.bind(this)}
            onScaleStart={this.onScaleStart.bind(this)}
            onScale={this.onScale.bind(this)}
            onRotateStart={this.onRotateStart.bind(this)}
            onRotate={this.onRotate.bind(this)}
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
  }
});

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
