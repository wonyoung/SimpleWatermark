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
        <View style={{flexDirection:'row'}} >
          <View style={{flex:2}} >
            <PositionControl onChangePosition={this.props.onChangePosition} />
          </View>
          <View style={{flex:8}} >
            <PaddingControl padding={this.props.padding} onChangePadding={this.props.onChangePadding} />
          </View>
        </View>
      </View>
    );
  }
}
