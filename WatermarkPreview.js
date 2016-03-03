'use strict';
import React, {
  Component,
  PanResponder,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

import { pannable, rotatable, scalable } from 'react-native-gesture-recognizers';

@rotatable
@scalable
@pannable ({ setGestureState: false })
class PannableImage extends Component {
  render() {
    return (
      <Image source={this.props.source} style={this.props.style}/>
    );
  }
}

export default class WatermarkPreview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      translateX: 0,
      translateY: 0,
      rotate: '0deg',
      scale: 1.0,
      layout: {
        width: 200,
        height: 200
      },
    };
  }

  onPan({ absoluteChangeX, absoluteChangeY }) {
    this.props.onChangePosition(0);

    this.setState({...this.state,
      translateX: absoluteChangeX,
      translateY: absoluteChangeY
    });
  }

  onScaleStart() {
    this.scale0 = this.state.scale;
  }

  onScale(scale) {
    this.setState(Object.assign({}, this.state, {
      scale: this.scale0*scale,
    }));
  }

  onRotateStart() {
    this.rotate0 = parseInt(this.state.rotate);
  }

  onRotate(deg) {
    const d = (this.rotate0 - parseInt(deg) + 360) % 360;

    this.setState(Object.assign({}, this.state, {
      rotate: d+'deg',
    }));
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

    const {rotate, scale} = this.state;
    let {translateX, translateY} = this.state;
    if (this.props.position === 1) {
      translateX = 0;
      translateY = 0;
    }

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
          <PannableImage
            source={watermarkSource}
            style={{height: wHeight, width: wWidth, opacity:this.props.opacity}}
            onPan={this.onPan.bind(this)}
            onScaleStart={this.onScaleStart.bind(this)}
            onScale={this.onScale.bind(this)}
            onRotateStart={this.onRotateStart.bind(this)}
            onRotate={this.onRotate.bind(this)}
            panDecoratorStyle={{transform}} />
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
