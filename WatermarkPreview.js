'use strict';
import React, {
  Component,
  PanResponder,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

import ViewPagerAndroid from './ViewPagerWorkaround';

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
    this.setState({...this.state, layout})
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => this.props.isPannable,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.props.isPannable,
      onPanResponderGrant: this._handlePanResponderGrant.bind(this),
      onPanResponderMove: this._handlePanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderEnd.bind(this),
      onPanResponderTerminate: this._handlePanResponderEnd.bind(this),
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

  _handlePanResponderGrant(evt, gestureState) {
    this.xPaddingStart = this.props.transform.xPadding;
    this.yPaddingStart = this.props.transform.yPadding;
  }

  _handlePanResponderMove(evt, {dx, dy}) {
    if (this.props.isPannable) {
      const x = this.xPaddingStart + dx/this.bg.layout.width;
      const y = this.yPaddingStart + dy/this.bg.layout.height;
      this.props.onChangePosition(x, y);
    }
  }

  _handlePanResponderEnd(evt, gestureState) {

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
      <View
        style={styles.container}
        onLayout={this._onLayout.bind(this)}
        {...this._panResponder.panHandlers}
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
