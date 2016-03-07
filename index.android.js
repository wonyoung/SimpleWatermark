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
import { OpacityControl, ScaleControl, AngleControl, PaddingControl } from './Sliders';
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
      scale: 0.5,
      angle: 0,
      position: 0,
      padding: 0,
      left: 0,
      top: 0
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

  _onScaleUpdate(scale) {
    this.setState({...this.state, scale});
  }

  _onAngleUpdate(fAngle) {
    const angle = parseInt(fAngle);
    this.setState({...this.state, angle});
  }

  _onPositionUpdate(position) {
    this.setState({...this.state, position});
  }

  _onPaddingUpdate(padding) {
    this.setState({...this.state, padding})
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
      ToastAndroid.show('done', ToastAndroid.SHORT);
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
        <WatermarkPreview
          onChangePosition={this._onPositionUpdate.bind(this)}
          {...this.state}
          />
        <OpacityControl opacity={this.state.opacity} onChangeOpacity={this._onOpacityUpdate.bind(this)} />
        <ScaleControl scale={this.state.scale} onChangeScale={this._onScaleUpdate.bind(this)} />
        <AngleControl angle={this.state.angle} onChangeAngle={this._onAngleUpdate.bind(this)} />
        <View style={{flexDirection:'row'}} >
          <View style={{flex:2}} >
            <PositionControl onChangePosition={this._onPositionUpdate.bind(this)} />
          </View>
          <View style={{flex:8}} >
            <PaddingControl padding={this.state.padding} onChangePadding={this._onPaddingUpdate.bind(this)} />
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
}

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
