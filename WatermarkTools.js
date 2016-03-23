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
  TouchableOpacity
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
  render() {
    const props = (this.props.save) ? {
      style:styles.button_save,
      onPress: this.props.onSave
    }:{ style:styles.button_save_disabled };
    return (
      <View
        style={styles.upper_container} >
        <Text
          {...props}
          >{I18n.t('save')}</Text>
      </View>
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
  upper_container: {
    top:0,
    right:0,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  button_save: {
    margin: 16,
    padding: 4,
    color: 'white',
    fontSize: 16
  },
  button_save_disabled: {
    margin: 16,
    padding: 4,
    color: 'gray',
    fontSize: 16
  },

});
