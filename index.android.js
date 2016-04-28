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
  StyleSheet
} from 'react-native';

import I18n from 'react-native-i18n';
const { Watermarker, ImagePicker } = React.NativeModules;
import WatermarkPreview from './WatermarkPreview';
import { WatermarkTools, UpperTools } from './WatermarkTools';
import { SaveDialog, InputTextDialog } from './Dialogs';
import { TransformController } from './Controllers';
import store from 'react-native-simple-store';

const STORAGE_KEY = '@SimpleWatermark:key';

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
      savePath: "/watermark",

      currentPage: 0
    };
  }

  shouldSave() {
    return this.state.watermark.uri && this.state.images.length > 0;
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('watermarkprogress', this.showProgress.bind(this));
    this.loadInitialState();
  }

  async loadInitialState() {
    try {
      const items = await store.get(STORAGE_KEY);

      if (items !== null) {
        const {
          watermark,
          opacity,
          scale,
          angle,
          xPadding,
          yPadding,
          savePath
        } = items;
        if (watermark !== undefined) {
          this.setState({watermark});
        }
        if (opacity !== undefined) {
          this.setState({transform: {...this.state.transform, opacity}});
        }
        if (scale !== undefined) {
          this.setState({transform: {...this.state.transform, scale}});
        }
        if (angle !== undefined) {
          this.setState({transform: {...this.state.transform, angle}});
        }
        if (xPadding !== undefined) {
          this.setState({transform: {...this.state.transform, xPadding}});
        }
        if (yPadding !== undefined) {
          this.setState({transform: {...this.state.transform, yPadding}});
        }
        if (savePath !== undefined) {
          this.setState({savePath});
        }
        console.log('storage loaded :', watermark, opacity, savePath);
      }
    } catch (e) {
      console.log('storage load failed',e);
    }
    this.setState({dialog: 'none'});
  }

  _onOpacityUpdate(opacity) {
    store.update(STORAGE_KEY, {opacity});
    this.setState({transform: {...this.state.transform, opacity}});
  }

  _onScaleUpdate(scale) {
    store.update(STORAGE_KEY, {scale});
    this.setState({transform: {...this.state.transform, scale}});
  }

  _onAngleUpdate(angle) {
    store.update(STORAGE_KEY, {angle});
    this.setState({transform: {...this.state.transform, angle}});
  }

  _onPaddingUpdate(xPadding, yPadding) {
    xPadding = Math.max(Math.min(xPadding, 1), 0);
    yPadding = Math.max(Math.min(yPadding, 1), 0);
    store.update(STORAGE_KEY, {xPadding, yPadding});
    this.setState({
      transform: {...this.state.transform, xPadding, yPadding}
    });
  }

  _onPageUpdate(currentPage) {
    this.setState({
      currentPage
    });
  }

  _onSavePathUpdate(savePath) {
    store.update(STORAGE_KEY, {savePath});
    this.setState({savePath});
  }

  setSavePathDialog() {
    this.setState({dialog: 'savepath'});
  }

  closeDialog() {
    this.setState({dialog: 'none'});
  }

  showProgress(a) {
    this.setState({
      writeProgress: a.progress,
      currentPage: a.current
    });
    this.preview.go(a.current);
  }

  async export() {
    console.log(this.state);
    const {
      watermark,
      images,
      ...props
    } = this.state;

    this.setState({dialog: 'onsave', writeProgress: 0.0});
    try {
      await Watermarker.make({
          images: images.map(i => i.uri),
          watermark: watermark.uri,
          ...props
      });
      this.setState({dialog:'none', writeProgress: 0.0});
      ToastAndroid.show(I18n.t('saved'), ToastAndroid.SHORT);
    } catch (e) {

    }
  }

  async launchImagePicker() {
    try {
      var added = await ImagePicker.launch(true);
      const images = this.state.images.concat(added);
      this.setState({images})
    } catch (e) {
      console.error(e);
    }
  }

  async launchWatermarkPicker() {
    try {
      await ImagePicker.clearCache();
      var watermark = await ImagePicker.copy();
      console.log(watermark);
      store.update(STORAGE_KEY, {watermark});
      this.setState({watermark});
    } catch (e) {
      console.error(e);
    }
  }

  toggleTransformController() {
    const transformOn = !this.state.transformOn;
    this.setState({transformOn});
  }

  removeCurrentImage() {
    this.state.images.splice(this.state.currentPage, 1);
    const prevPage = this.state.currentPage;
    const images = this.state.images;
    const currentPage = prevPage < images.length ? prevPage:(prevPage > 0) ? (prevPage - 1):0;

    this.setState({images, currentPage});
    this.preview.go(currentPage);
  }

  renderDialog() {
    if (this.state.dialog === "onsave") {
      return <SaveDialog progress={this.state.writeProgress} />
    }
    else if (this.state.dialog === "onstart") {
      return <Welcome />
    }
    else if (this.state.dialog === "savepath") {
      return (
        <InputTextDialog
          text={this.state.savePath}
          onChangeText={this._onSavePathUpdate.bind(this)}
          onExit={this.closeDialog.bind(this)}
          />
      );

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
            onChangeOpacity={this._onOpacityUpdate.bind(this)}
            onChangeScale={this._onScaleUpdate.bind(this)}
            onChangeAngle={this._onAngleUpdate.bind(this)}
            onChangePosition={this._onPaddingUpdate.bind(this)}
            isPannable={transformOn}
            onChangePage={this._onPageUpdate.bind(this)}
            ref={preview => this.preview = preview}
            {...props}
            />
          { this.renderTransformController() }
        </View>
        <WatermarkTools
          onImageSelect={() => this.launchImagePicker()}
          onWatermarkSelect={() => this.launchWatermarkPicker()}
          onToolsToggle={() => this.toggleTransformController()}
          onRemove={() => this.removeCurrentImage()}
          />
        <UpperTools
          current={this.state.currentPage + 1}
          total={this.state.images.length}
          save={this.shouldSave()}
          onSave={() => this.export()}
          onSavePathSelected={() => this.setSavePathDialog()}
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
        <Text style={{color:'black', fontSize:24}}>Simple Watermark  </Text>
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
