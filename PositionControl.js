'use strict';
import React, {
  Component,
  View
} from 'react-native';

import { MKRadioButton } from 'react-native-material-kit';

export default class PositionControl extends Component {
  constructor(props) {
    super(props);
    this.radiogroup = new MKRadioButton.Group();
  }

  onChecked(position) {
    return ({checked}) => {
      if (checked) {
        console.log(position);
        this.props.onChangePosition(position);
      }
    };
  }

  render() {
    return (
      <View style={{flex:2, flexDirection:'column'}}>
        <View style={{flex:1, flexDirection:'row'}}>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(1)} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(2)} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(3)} group={this.radiogroup}/>
        </View>
        <View style={{flex:1, flexDirection:'row'}}>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(4)} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(5)} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(6)} group={this.radiogroup}/>
        </View>
        <View style={{flex:1, flexDirection:'row'}}>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(7)} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(8)} group={this.radiogroup}/>
          <MKRadioButton checked={false} onCheckedChange={this.onChecked(9)} group={this.radiogroup}/>
        </View>
      </View>
    );
  }
}
