/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  Component,
  View,
  StyleSheet
} from 'react-native';

import ProgressBar from 'ProgressBarAndroid';

export class SaveDialog extends Component {
  render() {
    return (
      <View
        style={styles.save_dialog} >
        <ProgressBar
          progress={this.props.progress} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  save_dialog: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6
  }
});
