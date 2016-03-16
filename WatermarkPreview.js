'use strict';
import React, {
  Component,
  PanResponder,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

export default class WatermarkPreview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      layout: {
        width: 200,
        height: 200
      },
    };
  }

  _onLayout({nativeEvent: {layout}}) {
    const prev = this.state.layout;
    if (layout.width === prev.width && layout.height === prev.height) {
      return;
    }
    this.setState({...this.state, layout})
  }

  imageWithAspectRatio(src, layout) {
    const {height:layoutHeight, width:layoutWidth} = layout;
    const rotated = src.orientation >= 5;
    const aspectRatio = rotated ? src.height/src.width:src.width/src.height;
    const layoutAspectRatio = layoutWidth/layoutHeight;

    const width = (aspectRatio > layoutAspectRatio) ? layoutWidth:layoutHeight*aspectRatio;
    const height = (aspectRatio > layoutAspectRatio) ? layoutWidth/aspectRatio:layoutHeight;
    const top = (layoutHeight - height) / 2;
    const left = (layoutWidth - width) / 2;

    const { uri } = src;
    return {
      uri, width, height, top, left
    };
  }

  render() {
    const bg = this.imageWithAspectRatio(this.props.images[0], this.state.layout);
    const bgsource = {uri:bg.uri};
    const {width, height, top, left} = bg;

    const wm = this.imageWithAspectRatio(this.props.watermark, bg);
    const watermarkSource = {uri:wm.uri};
    let {width:wWidth, height:wHeight} = wm;
    let {angle: rotate, scale, position, padding} = this.props;
    let {left: translateX, top: translateY} = this.props;

    wWidth = wWidth * scale;
    wHeight = wHeight * scale;
    const wDiff = width - wWidth;
    const hDiff = height - wHeight;
    switch(position) {
      case 1:
        translateX = 0 + padding*wDiff;
        translateY = 0 + padding*hDiff;
        break;
      case 2:
        translateX = wDiff / 2;
        translateY = 0 + padding*hDiff;
        break;
      case 3:
        translateX = wDiff - padding*wDiff;
        translateY = 0 + padding*hDiff;
        break;
      case 4:
        translateX = 0 + padding*wDiff;
        translateY = hDiff / 2;
        break;
      case 5:
        translateX = wDiff / 2;
        translateY = hDiff / 2;
        break;
      case 6:
        translateX = wDiff - padding*wDiff;
        translateY = hDiff / 2;
        break;
      case 7:
        translateX = 0 + padding*hDiff;
        translateY = hDiff - padding*hDiff;
        break;
      case 8:
        translateX = wDiff / 2;
        translateY = hDiff - padding*hDiff;
        break;
      case 9:
        translateX = wDiff - padding*wDiff;
        translateY = hDiff - padding*hDiff;
        break;
    }
    rotate = rotate+'deg';
    const transform = [
      {rotate},
    ];
    const watermarkStyle = {
      height: wHeight,
      width: wWidth,
      top: translateY,
      left: translateX,
      opacity: this.props.opacity,
      transform
    };

    return (
      <View
        style={styles.container}
        onLayout={this._onLayout.bind(this)}
        >
        <Image
          source={bgsource}
          style={[styles.preview, {height, width, top, left}]}
          >
          <Image
            source={watermarkSource}
            style={[watermarkStyle]}
            />
        </Image>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 9,
    marginBottom: 0,
    flexWrap:'nowrap',
    backgroundColor: 'black'
  },
  preview: {
  }
});
