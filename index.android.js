/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  Text,
  Image,
  View,
  NativeModules,
  ToastAndroid,
  DeviceEventEmitter
} from 'react-native';

import I18n from 'react-native-i18n';

import Subscribable from 'Subscribable';

import { MKProgress } from 'react-native-material-kit';

const { Watermarker, ImagePicker, RNI18n } = NativeModules;
import { OpacityControl, ScaleControl, AngleControl, PaddingControl } from './Sliders';
import PositionControl from './PositionControl';
import WatermarkPreview from './WatermarkPreview';

const testimages = {
  images: [
    {
      height: 1200,
      path: "/data/user/0/com.simplewatermark/cache/photo-image:11",
      uri: "file:///data/user/0/com.simplewatermark/cache/photo-image%3A11",
      width: 1600
    },
    {
      height: 1424,
      path: "/data/user/0/com.simplewatermark/cache/photo-image:12",
      uri: "file://"+"/storage/emulated/0/DCIM/mountain-2.jpg",
      width: 2144,
    }
  ],
  watermark: {
    height: 512,
    path: "/storage/emulated/0/DCIM/624dc72b6deef6abddf29031c1ac7224.png",
    uri: "file://" + "/storage/emulated/0/DCIM/624dc72b6deef6abddf29031c1ac7224.png",
  //  uri: "content://media/external/images/media/10",
    width: 512
  }
};

const SimpleWatermark = React.createClass({
  getInitialState: () => ({
    watermark: testimages.watermark,
    images: testimages.images,
    opacity: 0.8,
    scale: 0.5,
    angle: 0,
    position: 0,
    padding: 0,
    left: 0,
    top: 0,
    onWriting: false,
    writeProgress: 0.0
  }),

  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    this.addListenerOn(DeviceEventEmitter, 'watermarkprogress', this.showProgress);
  },

  _onOpacityUpdate: function(opacity) {
    this.setState({...this.state, opacity});
  },

  _onScaleUpdate: function(scale) {
    this.setState({...this.state, scale});
  },

  _onAngleUpdate: function(fAngle) {
    const angle = parseInt(fAngle);
    this.setState({...this.state, angle});
  },

  _onPositionUpdate: function(position) {
    this.setState({...this.state, position});
  },

  _onPaddingUpdate: function(padding) {
    this.setState({...this.state, padding})
  },

  showProgress: function(a) {
    this.setState({...this.state, writeProgress: a.progress});
    console.log(this.state);
  },

  export: async function() {
    console.log(this.state);
    const {
      watermark,
      images,
      ...props
    } = this.state;

//    this.setState({...this.state, onWriting: true, writeProgress: 0.0});

    try {
      await Watermarker.make({
        images: images.map(i => i.uri),
        watermark: watermark.uri,
        ...props
      });
//      console.log(e);
      ToastAndroid.show('Image saved.', ToastAndroid.SHORT);
//      this.setState({...this.state, onWriting: false, writeProgress: 0.0});
    } catch (e) {
    }
  },

  launchImagePicker: async function() {
    try {
      var images = await ImagePicker.launch(true);
      console.log(images);
      this.setState({...this.state, images })
    } catch (e) {
      console.error(e);
    }
  },

  launchWatermarkPicker: async function() {
    try {
      var [watermark,] = await ImagePicker.launch(false);
      console.log(watermark);
      this.setState({...this.state, watermark});
    } catch (e) {
      console.error(e);
    }
  },

  render: function() {
    const BUTTON_SIZE = 40;
    const button_style = {
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: 'lightgreen',
      justifyContent:'center'
    }

    return (
      <View style={{flex:1} } ref='rootView'>
      <MKProgress progress={this.state.writeProgress} />
        <WatermarkPreview
          onChangePosition={this._onPositionUpdate}
          {...this.state}
          />

        <OpacityControl opacity={this.state.opacity} onChangeOpacity={this._onOpacityUpdate} />
        <ScaleControl scale={this.state.scale} onChangeScale={this._onScaleUpdate} />
        <AngleControl angle={this.state.angle} onChangeAngle={this._onAngleUpdate} />
        <View style={{flexDirection:'row'}} >
          <View style={{flex:2}} >
            <PositionControl onChangePosition={this._onPositionUpdate} />
          </View>
          <View style={{flex:8}} >
            <PaddingControl padding={this.state.padding} onChangePadding={this._onPaddingUpdate} />
          </View>
        </View>
        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', position:'relative'}} >
          <View style={button_style}>
            <Text
              onPress={()=>this.launchImagePicker()}>  Select...  </Text>
          </View>
          <View style={button_style}>
            <Text
              onPress={()=>this.launchWatermarkPicker()}>  Watermark  </Text>
          </View>
          <View style={button_style}>
            <Text
              onPress={()=>this.export()}>     Save     </Text>
          </View>
        </View>
      </View>
    );
  }
});


I18n.fallbacks = true;
I18n.translations = {
  en: {
    save: 'Save  '
  },
  ko: {
    save: '저장 '
  }
};

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
