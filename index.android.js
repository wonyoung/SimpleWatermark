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

import I18n from 'react-native-i18n';
const { Watermarker, ImagePicker } = React.NativeModules;
import WatermarkPreview from './WatermarkPreview';
import { WatermarkTools, UpperTools } from './WatermarkTools';
import { SaveDialog, InputTextDialog } from './Dialogs';
import { TransformController } from './Controllers';

class SimpleWatermark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watermark: {},
      images: [],
      transform: {
        opacity: 0.8,
        scale: 0.5,
        angle: 0.0,
        xPadding: 0.5,
        yPadding: 0.5,
      },
      writeProgress: 0.0,
      dialog: "onstart",
      transformOn: false,
      savePath: "/watermark"
    };
  }

  shouldSave() {
    return this.state.watermark.uri && this.state.images.length > 0;
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('watermarkprogress', this.showProgress.bind(this));
    this.setState({...this.state, dialog: 'none'});
  }

  _onOpacityUpdate(opacity) {
    this.setState({...this.state, transform: {...this.state.transform, opacity}});
  }

  _onScaleUpdate(scale) {
    this.setState({...this.state, transform: {...this.state.transform, scale}});
  }

  _onAngleUpdate(angle) {
    this.setState({...this.state, transform: {...this.state.transform, angle}});
  }

  _onPaddingUpdate(xPadding, yPadding) {
    xPadding = Math.max(Math.min(xPadding, 1), 0);
    yPadding = Math.max(Math.min(yPadding, 1), 0);
    this.setState({
      ...this.state,
      transform: {...this.state.transform, xPadding, yPadding}
    });
  }

  _onSavePathUpdate(savePath) {
    this.setState({...this.state, savePath});
  }

  showProgress(a) {
    this.setState({...this.state, writeProgress: a.progress}, () => {
      console.log('progress', this.state.writeProgress);
    });
    console.log(this.state);
  }

  async export() {
    console.log(this.state);
    const {
      watermark,
      images,
      ...props
    } = this.state;

    this.setState({...this.state, dialog: 'onsave', writeProgress: 0.0});
    try {
      await Watermarker.make({
          images: images.map(i => i.uri),
          watermark: watermark.uri,
          ...props
      });
      this.setState({...this.state, dialog:'none', writeProgress: 0.0});
      ToastAndroid.show(I18n.t('saved'), ToastAndroid.SHORT);
    } catch (e) {

    }
  }

  async launchImagePicker() {
    try {
      var images = await ImagePicker.launch(true);
      console.log(images);
      this.setState({...this.state, images })
    } catch (e) {
      console.error(e);
    }
  }

  async launchWatermarkPicker() {
    try {
      var [watermark,] = await ImagePicker.launch(false);
      console.log(watermark);
      this.setState({...this.state, watermark});
    } catch (e) {
      console.error(e);
    }
  }

  toggleTransformController() {
    const transformOn = !this.state.transformOn;
    this.setState({...this.state, transformOn});
  }

  renderDialog() {
    if (this.state.dialog === "onsave") {
      return <SaveDialog progress={this.state.writeProgress} />
    }
    else if (this.state.dialog === "onstart") {
      return <Welcome />
    }
  }

  renderTransformController() {
    if (this.state.transformOn) {
      return (
        <TransformController
          style={styles.transform_controller}
          {...this.state.transform}
          onChangeOpacity={this._onOpacityUpdate.bind(this)}
          onChangeScale={this._onScaleUpdate.bind(this)}
          onChangeAngle={this._onAngleUpdate.bind(this)}
          onChangePadding={this._onPaddingUpdate.bind(this)}
          />
      );
    }
  }

  render() {
    const {
      transformOn,
      ...props
    } = this.state;

    return (
      <View style={styles.container} >
        <View style={styles.workspace} >
          <WatermarkPreview
            onChangePosition={this._onPaddingUpdate.bind(this)}
            isPannable={transformOn}
            {...props}
            />
          { this.renderTransformController() }
        </View>
        <WatermarkTools
          onImageSelect={() => this.launchImagePicker()}
          onWatermarkSelect={() => this.launchWatermarkPicker()}
          onToolsToggle={() => this.toggleTransformController()}
          />
        <UpperTools
          save={this.shouldSave()}
          onSave={() => this.export()}
          />
        {this.renderDialog()}
      </View>
    );
  }
}

class Welcome extends Component {
  render() {
    return (
      <View
        style={styles.welcome} >
        <Text style={{color:'black', fontSize:24}}>Simple Watermark</Text>
      </View>
    );
  }
}

I18n.fallbacks = true;
I18n.translations = {
  en: {
    save: 'Save  ',
    savePath: 'Save path ',
    saved: 'Saved. '
  },
  ko: {
    save: '저장 ',
    savePath: '저장 위치 ',
    saved: '저장되었습니다. '
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  workspace: {
    flex: 1,
  },
  transform_controller: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0.6
  },
  welcome: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

AppRegistry.registerComponent('SimpleWatermark', () => SimpleWatermark);
