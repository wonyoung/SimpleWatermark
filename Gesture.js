'use strict';

import React, {
  PanResponder
} from 'react-native';

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function angle(x1, y1, x2, y2) {
  return Math.atan2(x2-x1,y2-y1)*180/Math.PI;
}

function composite(that, props) {
  const self = this;
  let gesture = {
    onStartShouldSetPanResponder: (evt, gestureState) =>
      (self.onStartShouldSetPanResponder(evt, gestureState) ||
      that.onStartShouldSetPanResponder(evt, gestureState))
    ,
    onMoveShouldSetPanResponder: (evt, gestureState) =>
      (self.onMoveShouldSetPanResponder(evt, gestureState) ||
      that.onMoveShouldSetPanResponder(evt, gestureState))
    ,
    handleGrant: (evt, gestureState) => {
      if (self.onStartShouldSetPanResponder(evt, gestureState)) {
        self.handleGrant(evt, gestureState);
      }
      if (that.onStartShouldSetPanResponder(evt, gestureState)) {
        that.handleGrant(evt, gestureState);
      }
    },
    handleMove: (evt, gestureState) => {
      if (self.onMoveShouldSetPanResponder(evt, gestureState)) {
        self.handleMove(evt, gestureState);
      }
      if (that.onMoveShouldSetPanResponder(evt, gestureState)) {
        that.handleMove(evt, gestureState);
      }
    },
    handleEnd: (evt, gestureState) => {
      self.handleEnd(evt, gestureState);
      that.handleEnd(evt, gestureState);
    },
    composite
  };

  if (props != null) {
    Object.assign(gesture, props);
  }

  const {panHandlers} = PanResponder.create({
    onStartShouldSetPanResponder: gesture.onStartShouldSetPanResponder,
    onMoveShouldSetPanResponder: gesture.onMoveShouldSetPanResponder,
    onPanResponderGrant: gesture.handleGrant,
    onPanResponderMove: gesture.handleMove,
    onPanResponderRelease: gesture.handleEnd,
    onPanResponderTerminate: gesture.handleEnd,
  });
  Object.assign(gesture, {panHandlers});

  return gesture;
}

export function createPanner(view, props) {
  let gesture = {
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    handleGrant: (evt, gestureState) => {
      view.onPanBegin && view.onPanBegin();
    },
    handleMove: (evt, {dx, dy}) => {
      view.onPanMove && view.onPanMove(dx, dy);
    },
    handleEnd: (evt, gestureState) => {
      view.onPanEnd && view.onPanEnd();
    },
    composite
  };

  if (props != null) {
    Object.assign(gesture, props);
  }

  const {panHandlers} = PanResponder.create({
    onStartShouldSetPanResponder: gesture.onStartShouldSetPanResponder,
    onMoveShouldSetPanResponder: gesture.onMoveShouldSetPanResponder,
    onPanResponderGrant: gesture.handleGrant,
    onPanResponderMove: gesture.handleMove,
    onPanResponderRelease: gesture.handleEnd,
    onPanResponderTerminate: gesture.handleEnd,
  });
  Object.assign(gesture, {panHandlers});

  return gesture;
}

export function createScaler(view, props) {
  let isScaling = false;
  let dist0 = 1.0;
  let gesture = {
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    handleGrant: (evt, gestureState) => {
    },
    handleMove: ({ nativeEvent: {touches}} , {numberActiveTouches}) => {
      if (numberActiveTouches < 2) {
        isScaling = false;
      }
      else {
        const [{ pageX : x1, pageY : y1 }, { pageX : x2, pageY : y2 }] = touches;
        if (!isScaling) {
          isScaling = true;
          dist0 = distance(x1, y1, x2, y2);
          view.onScaleBegin && view.onScaleBegin();
        }
        else {
          const dist = distance(x1, y1, x2, y2);
          const scale = dist / dist0;
          view.onScale && view.onScale(scale);
        }
      }
    },
    handleEnd: (evt, gestureState) => {
      isScaling = false;
      view.onScaleEnd && view.onScaleEnd();
    },
    composite
  };

  if (props != null) {
    Object.assign(gesture, props);
  }

  const {panHandlers} = PanResponder.create({
    onStartShouldSetPanResponder: gesture.onStartShouldSetPanResponder,
    onMoveShouldSetPanResponder: gesture.onMoveShouldSetPanResponder,
    onPanResponderGrant: gesture.handleGrant,
    onPanResponderMove: gesture.handleMove,
    onPanResponderRelease: gesture.handleEnd,
    onPanResponderTerminate: gesture.handleEnd,
  });
  Object.assign(gesture, {panHandlers});

  return gesture;
}

export function createRotator(view, props) {
  let isRotating = false;
  let deg0 = 0.0;
  let gesture = {
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    handleGrant: (evt, gestureState) => {
    },
    handleMove: ({ nativeEvent: {touches}} , {numberActiveTouches}) => {
      if (numberActiveTouches < 2) {
        isRotating = false;
      }
      else {
        const [{ pageX : x1, pageY : y1 }, { pageX : x2, pageY : y2 }] = touches;
        if (!isRotating) {
          isRotating = true;
          deg0 = angle(x1, y1, x2, y2);
          view.onRotateBegin && view.onRotateBegin();
        }
        else {
          const deg = angle(x1, y1, x2, y2);
          const degree = (deg - deg0 + 360) % 360;
          view.onRotate && view.onRotate(degree);
        }
      }
    },
    handleEnd: (evt, gestureState) => {
      isRotating = false;
      view.onRotateEnd && view.onRotateEnd();
    },
    composite
  };

  if (props != null) {
    Object.assign(gesture, props);
  }

  const {panHandlers} = PanResponder.create({
    onStartShouldSetPanResponder: gesture.onStartShouldSetPanResponder,
    onMoveShouldSetPanResponder: gesture.onMoveShouldSetPanResponder,
    onPanResponderGrant: gesture.handleGrant,
    onPanResponderMove: gesture.handleMove,
    onPanResponderRelease: gesture.handleEnd,
    onPanResponderTerminate: gesture.handleEnd,
  });
  Object.assign(gesture, {panHandlers});

  return gesture;
}

export default {
  createPanner,
  createScaler,
  createRotator
}
