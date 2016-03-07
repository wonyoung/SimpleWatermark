'use strict';
import React, {
  Component,
  View,
  TouchableWithoutFeedback,
  Text,
  StyleSheet
} from 'react-native';

class RButton extends Component {
  render() {
    return (
      <TouchableWithoutFeedback onPress={this.props.onPress} >
        <Text style={(this.props.checked ? styles.checked:styles.unchecked)}>    </Text>
      </TouchableWithoutFeedback>
    );
  }
}

export default class PositionControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: 0
    }
  }

  _onPress(position) {
    return (() => {
      this.setState({checked:position});
      this.props.onChangePosition(position);
    });
  }

  render() {
    let check = new Array(9).fill(false);
    if (this.state.checked > 0) {
      check[this.state.checked-1] = true;
    }
    return (
      <View style={{flex:2, flexDirection:'column'}}>
        <View style={{flexDirection:'row'}}>
          <RButton checked={check[0]} onPress={this._onPress(1)} />
          <RButton checked={check[1]} onPress={this._onPress(2)} />
          <RButton checked={check[2]} onPress={this._onPress(3)} />
        </View>
        <View style={{flexDirection:'row'}}>
          <RButton checked={check[3]} onPress={this._onPress(4)} />
          <RButton checked={check[4]} onPress={this._onPress(5)} />
          <RButton checked={check[5]} onPress={this._onPress(6)} />
        </View>
        <View style={{flexDirection:'row'}}>
          <RButton checked={check[6]} onPress={this._onPress(7)} />
          <RButton checked={check[7]} onPress={this._onPress(8)} />
          <RButton checked={check[8]} onPress={this._onPress(9)} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  checked: {
    backgroundColor: 'black'
  },
  unchecked: {
    backgroundColor: 'white'
  }
})
