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

  imageWithAspectRatio(src) {
    const {height:layoutHeight, width:layoutWidth} = this.state.layout;

    const aspectRatio = src.isVertical ? src.width/src.height:src.height/src.width;
    const layoutAspectRatio = layoutWidth/layoutHeight;

    const width = (aspectRatio > layoutAspectRatio) ? layoutWidth:layoutHeight*aspectRatio;
    const height = (aspectRatio > layoutAspectRatio) ? layoutWidth/aspectRatio:layoutHeight;
    const top = (layoutHeight - height) / 2;
    const left = (layoutWidth - width) / 2;

    const uri = src.uri;
    return {
      uri, width, height, top, left
    };
  }

  render() {
    const bg = this.imageWithAspectRatio(this.props.images[0]);
    const bgsource = {uri:bg.uri};
    const {width, height, top, left} = bg;

    const wm = this.imageWithAspectRatio(this.props.watermark);
    const watermarkSource = {uri:wm.uri};
    const {width:wWidth, height:wHeight} = wm;

    let {angle: rotate, scale} = this.props;
    let {left: translateX, top: translateY} = this.props;
    if (this.props.position === 1) {
      translateX = 0;
      translateY = 0;
    }

    rotate = rotate+'deg';
    const transform = [
      {translateX},
      {translateY},
      {rotate},
      {scale}
    ];

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
            style={
              [{
                height: wHeight,
                width: wWidth,
                opacity:this.props.opacity,
                transform
              }]
            }
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
    borderWidth: 3,
    borderColor: 'yellow'
  },
  preview: {
  }
});
