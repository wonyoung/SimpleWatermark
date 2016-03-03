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
  ToastAndroid
} from 'react-native';

const { ImagePickerManager, Watermarker } = NativeModules;
import OpacityControl from './OpacityControl';
import PositionControl from './PositionControl';
import WatermarkPreview from './WatermarkPreview';

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
      opacity: 0.8,
      position: 0
    };
  }

  selectWatermark(watermark) {
    this.setState({...this.state, watermark});
  }

  selectPhoto(image) {
    const images = (image.images) ? image.images:[image];
    this.setState({...this.state, images });
  }

  _onOpacityUpdate(opacity) {
    this.setState({...this.state, opacity});
  }

  _onPositionUpdate(position) {
    this.setState({...this.state, position});
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

  export() {
    console.log(this.state);
    console.log(Watermarker);
    Watermarker.make({
      backgroundPaths: this.state.images.map(i => i.path),
      watermarkPath: this.state.watermark.path,
      scale:0.5,
      alpha:this.state.opacity,
      angle:45,
      left:50,
      top:50
    }, (e) => {
      console.log(e);
      ToastAndroid.show('done' + e.path, ToastAndroid.SHORT);
    });
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
        <WatermarkPreview onChangePosition={this._onPositionUpdate.bind(this)} {...this.state} />
        <OpacityControl opacity={this.state.opacity} onChangeOpacity={this._onOpacityUpdate.bind(this)} />
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
}

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
