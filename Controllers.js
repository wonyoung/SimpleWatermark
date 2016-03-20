/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  Component,
  View,
  StyleSheet,
} from 'react-native';

import { OpacityControl, ScaleControl, AngleControl, PaddingControl } from './Sliders';
import PositionControl from './PositionControl';

export class TransformController extends Component {
  render() {
    return (
      <View style={this.props.style} >
        <OpacityControl opacity={this.props.opacity} onChangeOpacity={this.props.onChangeOpacity} />
        <ScaleControl scale={this.props.scale} onChangeScale={this.props.onChangeScale} />
        <AngleControl angle={this.props.angle} onChangeAngle={this.props.onChangeAngle} />
        <View style={{flexDirection:'row', alignItems:'center'}} >
          <View style={{flex:8}} >
            <PaddingControl
              xPadding={this.props.xPadding}
              yPadding={this.props.yPadding}
              onChangePadding={this.props.onChangePadding} />
          </View>
        </View>
      </View>
    );
  }
}
