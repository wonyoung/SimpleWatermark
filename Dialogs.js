/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  Component,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  ProgressBarAndroid,
  NativeModules
} from 'react-native';

import I18n from 'react-native-i18n';

export class SaveDialog extends Component {
  render() {
    return (
      <View style={styles.dialog} >
        <View style={styles.dialog_bg} />
        <ProgressBarAndroid
          progress={this.props.progress} />
      </View>
    );
  }
}

export class InputTextDialog extends Component {
  render() {
    return (
      <TouchableWithoutFeedback onPress={this.props.onExit}>
        <View style={styles.dialog} >
          <View style={styles.inputTextDialog} >
            <Text>{I18n.t('savePath')}</Text>
            <TextInput
              style={styles.inputText}
              onChangeText={this.props.onChangeText}
              value={this.props.text}
              />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog_bg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0.6
  },
  inputTextDialog: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  inputText: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1
  }
});
