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

import Subscribable from 'Subscribable';

const { ImagePickerManager, Watermarker, ImagePicker } = NativeModules;
import { OpacityControl, ScaleControl, AngleControl, PaddingControl } from './Sliders';
import PositionControl from './PositionControl';
import WatermarkPreview from './WatermarkPreview';

const testimages = {
  images: [
    {
      height: 1200,
      isVertical: true,
      path: "/data/user/0/com.simplewatermark/cache/photo-image:11",
      uri: "file:///data/user/0/com.simplewatermark/cache/photo-image%3A11",
      width: 1600
    },
    {
      height: 1424,
      isVertical: true,
      path: "/data/user/0/com.simplewatermark/cache/photo-image:12",
      uri: "file://"+"/storage/emulated/0/DCIM/mountain-2.jpg",
      width: 2144,
    }
  ],
  watermark: {
    height: 512,
    isVertical: true,
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
    top: 0
  }),

  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    this.addListenerOn(DeviceEventEmitter, 'watermarkprogress', this.showProgress);
  },

  selectWatermark: function(watermark) {
    this.setState({...this.state, watermark});
  },

  selectPhoto: function(image) {
    const images = (image.images) ? image.images:[image];
    this.setState({...this.state, images });
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

  launchImageLibrary: function(options, callback) {
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

        callback(response);
      }
    );
  },

  showProgress: function(a) {
    console.log('Progress', a);
  },

  export: function() {
    console.log(this.state);
    const {
      watermark,
      images,
      ...props
    } = this.state;

    Watermarker.make({
      backgroundPaths: images.map(i => i.path),
      watermarkPath: watermark.path,
      ...props
    }, (e) => {
      console.log(e);
      ToastAndroid.show('Image saved.', ToastAndroid.SHORT);
    });
  },

  launchPicker: async function() {
    try {
      var k = await ImagePicker.launch(true);

      console.log(k);
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
      <View style={{borderWidth:2, borderColor:'red', flex:1} }  ref='rootView'>
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
              onPress={()=>this.launchImageLibrary({multiple:true}, this.selectPhoto)}>  Select...  </Text>
          </View>
          <View style={button_style}>
            <Text
              onPress={()=>this.launchImageLibrary({multiple:false}, this.selectWatermark)}>  Watermark  </Text>
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

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
