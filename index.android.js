/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  View,
  Text,
  ToastAndroid,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';

import Subscribable from 'Subscribable';

const { Watermarker, ImagePicker } = React.NativeModules;
import WatermarkPreview from './WatermarkPreview';
import { WatermarkTools, UpperTools } from './WatermarkTools';
import { SaveDialog } from './Dialogs';
import { TransformController } from './Controllers';

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
    writeProgress: 0.0,
    onStarting: true
  }),

  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    this.addListenerOn(DeviceEventEmitter, 'watermarkprogress', this.showProgress);
    this.setState({...this.state, onStarting: false});
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
    this.setState({...this.state, writeProgress: a.progress}, () => {
      console.log('progress', this.state.writeProgress);
    });
    console.log(this.state);
  },

  export: async function() {
    console.log(this.state);
    const {
      watermark,
      images,
      ...props
    } = this.state;

    this.setState({...this.state, onWriting: true, writeProgress: 0.0});
    try {
      await Watermarker.make({
          images: images.map(i => i.uri),
          watermark: watermark.uri,
          ...props
      });
      ToastAndroid.show('Image saved.', ToastAndroid.SHORT);
      setTimeout(() => {
        this.setState({...this.state, onWriting: false, writeProgress: 0.0});
      }, 1500);
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

    return (
      <View style={{flex:1, backgroundColor:'black'} } ref='rootView'>
        <WatermarkPreview
          onChangePosition={this._onPositionUpdate}
          {...this.state}
          />
        <TransformController
          opacity={this.state.opacity}
          scale={this.state.scale}
          angle={this.state.angle}
          padding={this.state.padding}
          onChangeOpacity={this._onOpacityUpdate}
          onChangeScale={this._onScaleUpdate}
          onChangeAngle={this._onAngleUpdate}
          onChangePosition={this._onPositionUpdate}
          onChangePadding={this._onPaddingUpdate}
          />
        <WatermarkTools
          onImageSelect={() => this.launchImagePicker()}
          onWatermarkSelect={() => this.launchWatermarkPicker()}
          onToolsToggle={() => this.launchWatermarkPicker()}
          />
        <UpperTools
          onSave={() => this.export()}
          />
        {this.state.onWriting ? <SaveDialog progress={this.state.writeProgress} />:[]}
        {this.state.onStarting ? <Welcome />:[]}
      </View>
    );
  }
});

class Welcome extends Component {
  render() {
    return (
      <View
        style={styles.save_dialog} >
        <Text style={{color:'black'}}> Simple Watermark </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
