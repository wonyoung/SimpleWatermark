'use strict';
import React, {
  Component,
  PanResponder,
  StyleSheet,
  Text,
  Image,
  ViewPagerAndroid,
  View
} from 'react-native';

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
      onStartShouldSetPanResponder: (evt, gestureState) => this.props.movePosition,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.props.movePosition,
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
    const bg = this.imageWithAspectRatio(props.image, state.layout);
    const bgsource = {uri:bg.uri};
    const {width, height, top, left} = bg;

    const wm = this.imageWithAspectRatio(props.watermark, bg);
    const watermarkSource = {uri:wm.uri};
    let {width:wWidth, height:wHeight} = wm;
    let {angle: rotate, scale, position, xPadding, yPadding} = props;
    let {left: translateX, top: translateY} = props;

    wWidth = wWidth * scale;
    wHeight = wHeight * scale;
    const wDiff = width - wWidth;
    const hDiff = height - wHeight;
    switch(position) {
      case 1:
        translateX = 0 + xPadding*wDiff;
        translateY = 0 + yPadding*hDiff;
        break;
      case 2:
        translateX = wDiff / 2;
        translateY = 0 + yPadding*hDiff;
        break;
      case 3:
        translateX = wDiff - xPadding*wDiff;
        translateY = 0 + yPadding*hDiff;
        break;
      case 4:
        translateX = 0 + xPadding*wDiff;
        translateY = hDiff / 2;
        break;
      case 5:
        translateX = wDiff / 2;
        translateY = hDiff / 2;
        break;
      case 6:
        translateX = wDiff - xPadding*wDiff;
        translateY = hDiff / 2;
        break;
      case 7:
        translateX = 0 + xPadding*wDiff;
        translateY = hDiff - yPadding*hDiff;
        break;
      case 8:
        translateX = wDiff / 2;
        translateY = hDiff - yPadding*hDiff;
        break;
      case 9:
        translateX = wDiff - xPadding*wDiff;
        translateY = hDiff - yPadding*hDiff;
        break;
    }
    rotate = rotate+'deg';
    const transform = [
      {rotate},
    ];
    const watermarkStyle = {
      opacity: props.opacity,
      transform
    };

    this.bg = {
      uri: bgsource,
      layout: {
        width, height, left, top
      }
    };

    this.wm = {
      uri: watermarkSource,
      layout: {
        width: wWidth,
        height: wHeight,
        left: translateX,
        top: translateY
      }
    };

    this.xdiff = wDiff;
    this.ydiff = hDiff;
  }

  _handlePanResponderGrant(evt, gestureState) {
    this.xPaddingStart = this.props.xPadding;
    this.yPaddingStart = this.props.yPadding;
  }

  _handlePanResponderMove(evt, {dx, dy}) {
    if (this.props.movePosition) {
      const x = this.xPaddingStart + dx/this.xdiff;
      const y = this.yPaddingStart + dy/this.ydiff;
      console.log(dx, dy, x, y)
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
      uri, width, height, top, left
    };
  }

  render() {
    const {angle, opacity} = this.props;
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
          source={this.bg.uri}
          style={[styles.preview, this.bg.layout]}
          >
          <Image
            source={this.wm.uri}
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
