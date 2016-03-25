'use strict';
import React, {
  Component,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

import ViewPagerAndroid from './ViewPagerWorkaround';
import Gesture from './Gesture';

export default class WatermarkPreview extends Component {
    render() {
      const {
        images,
        ...props
      } = this.props;

      return (
        <ViewPagerAndroid
          style={styles.viewPager}
          initialPage={0} >
          {
            this.props.images.map((image, i) => (
              <View key={i} collapsable={false}>
                <WatermarkPreviewItem
                  image={image}
                  {...props}
                  />
              </View>
            ))
          }
        </ViewPagerAndroid>
      );
    }
}

class WatermarkPreviewItem extends Component {
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
    console.log(layout);
    this.setState({layout})
  }

  componentWillMount() {
    this.gesture = Gesture.createPanner(this)
      .composite(Gesture.createScaler(this))
      .composite(Gesture.createRotator(this), {
      onStartShouldSetPanResponder: (evt, gestureState) => this.props.isPannable,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.props.isPannable,
    });

    this._updatePositions(this.props, this.state);
  }

  componentWillUpdate(props, state) {
    this._updatePositions(props, state);
  }

  _updatePositions(props, state) {
    this.bg = this.imageWithAspectRatio(props.image, state.layout);
    this.wm = this.imageWithAspectRatio(props.watermark, this.bg.layout);

    const {width: bgw, height: bgh} = this.bg.layout;
    const {scale, xPadding, yPadding} = props.transform;

    const width = this.wm.layout.width * scale;
    const height = this.wm.layout.height * scale;
    const left = xPadding*bgw - width/2;
    const top = yPadding*bgh - height/2;
    const wDiff = bgw - width;
    const hDiff = bgh - height;

    this.wm.layout = {
      width,
      height,
      left,
      top
    };

    this.xdiff = wDiff;
    this.ydiff = hDiff;
  }

  onPanBegin() {
    this.xPaddingStart = this.props.transform.xPadding;
    this.yPaddingStart = this.props.transform.yPadding;
  }

  onPanMove(dx, dy) {
    if (this.props.isPannable) {
      const x = this.xPaddingStart + dx/this.bg.layout.width;
      const y = this.yPaddingStart + dy/this.bg.layout.height;
      this.props.onChangePosition(x, y);
    }
  }

  onScaleBegin() {
    this.scale0 = this.props.transform.scale;
  }

  onScale(scale) {
    if (this.props.isPannable) {
      this.props.onChangeScale(this.scale0*scale);
    }
  }

  onRotateBegin() {
    this.rotate0 = this.props.transform.angle;
  }

  onRotate(degree) {
    if (this.props.isPannable) {
      const d = (this.rotate0 - degree + 360) % 360;
      this.props.onChangeAngle(d);
    }
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
      uri,
      layout: {width, height, top, left}
    };
  }

  render() {
    const {angle, opacity} = this.props.transform;
    const watermarkStyle = {
      ...this.wm.layout,
      opacity,
      transform: [
        {rotate: angle+'deg'}
      ]
    };

    return (
      <View style={styles.viewPager} {...this.gesture.panHandlers} >
        <View
          style={styles.container}
          onLayout={this._onLayout.bind(this)}
          >
          <Image
            source={this.bg}
            style={[styles.preview, this.bg.layout]}
            >
            <Image
              source={this.wm}
              style={[watermarkStyle]}
              />
          </Image>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewPager: {
    flex: 1
  },
  container: {
    flex: 1,
    marginBottom: 0,
    flexWrap:'nowrap',
    backgroundColor: 'black'
  },
  preview: {
  }
});
