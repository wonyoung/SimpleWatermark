/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  Component,
  Text,
  Image,
  View,
  NativeModules,
  StyleSheet,
  TouchableOpacity,
  ToolbarAndroid
} from 'react-native';

import I18n from 'react-native-i18n';

export class WatermarkTools extends Component {
  render() {
    return (
      <View style={[this.props.style,styles.button_container]} >
        <TouchableOpacity onPress={this.props.onImageSelect} >
          <Image
            style={styles.button}
            source={require('./img/ic_photo_library_white.png')}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.props.onWatermarkSelect} >
          <Image
            style={styles.button}
            source={require('./img/ic_format_paint_white.png')}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.props.onToolsToggle} >
          <Image
            style={styles.button}
            source={require('./img/ic_tune_white.png')}
            />
        </TouchableOpacity>
      </View>
    );
  }
}

export class UpperTools extends Component {
  _onActionSelected(position) {
    if (position === 0) {
      this.props.onSave();
    }
    else if (position === 1) {
      this.props.onSavePathSelected && this.props.onSavePathSelected();
    }
  }

  render() {
    let actions = [];
    const offset = this.props.save ? 0:1;
    if (this.props.save) {
      actions.push({
        title: I18n.t('save'),
        show: 'always',
        showWithText: true
      });
    }
    actions.push({
      title: I18n.t('savePath'),
      show: 'never'
    });

    return (
      <ToolbarAndroid
        style={styles.toolbar}
        actions={actions}
        onActionSelected={(position) => this._onActionSelected(position + offset)} />
    );
  }
}

const styles = StyleSheet.create({
  button_container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative'
  },
  button: {
    margin: 8,
    padding: 4
  },
  toolbar: {
    position: 'absolute',
    top:0,
    left:0,
    right:0,
    height: 56,
  }
});
