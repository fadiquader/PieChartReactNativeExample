import React, {Component} from 'react';
import { StyleSheet, Dimensions, SafeAreaView, Animated} from 'react-native';
import * as d3 from 'd3';
import { Svg, G, Path, Text, TSpan } from 'react-native-svg';
import {PanGestureHandler, PinchGestureHandler, State,} from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
// create animated svg component
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      arcs: [],
      data: [1, 2, 0.5, 1, 1.5],
    };
    // pinch handler
    this._baseScale = new Animated.Value(1);
    this._pinchScale = new Animated.Value(1);
    this._scale = Animated.multiply(this._baseScale, this._pinchScale);
    this._lastScale = 1;
    this._onPinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this._pinchScale } }],
      { useNativeDriver: true }
    );
    // pan handler
    this._lastOffset = {x: 0, y: 0};
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._onPanGestureEvent = Animated.event(
      [{
        nativeEvent: {
          translationY: this._translateY,
          translationX: this._translateX,
        }
      }],
      {useNativeDriver: true}
    );
  }
  componentDidMount() {
    this.buildPieState();
  }
  _onPinchHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
    }
  };
  _onTiltGestureStateChange = event => {
    this._lastOffset.x += event.nativeEvent.translationX;
    this._lastOffset.y += event.nativeEvent.translationY;
    this._translateX.setOffset(this._lastOffset.x);
    this._translateX.setValue(0);
    this._translateY.setOffset(this._lastOffset.y);
    this._translateY.setValue(0);
  };
  buildPieState = () => {
    const pie = d3.pie();
    const piedData = pie(this.state.data);
    this.setState({
      arcs: piedData
    });
  };
  render() {
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const radius = Math.min(width, height) / 2;
    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius * 0.5);
    return (
      <SafeAreaView>
        <Svg width={width} height={100}>
          <Text
            fontSize={20}
            y={50}
            transform={`translate(${width/2})`}
          >
            <TSpan width={'100%'} height={'100%'} textAnchor="middle">
              Digital Cloud
            </TSpan>
          </Text>
        </Svg>
        <PinchGestureHandler
          onGestureEvent={this._onPinchGestureEvent}
          onHandlerStateChange={this._onPinchHandlerStateChange}>
          <Animated.View
            collapsable={false}
          >
            <PanGestureHandler
              onGestureEvent={this._onPanGestureEvent}
              onHandlerStateChange={this._onTiltGestureStateChange}
              avgTouches
            >
              <Animated.View
                style={{
                  transform: [
                    { perspective: 200 },
                    { scale: this._scale },
                  ]
                }}>
                <AnimatedSvg
                  width={width}
                  height={height}
                  style={{
                    transform: [
                      {translateX: this._translateX},
                      {translateY: this._translateY},
                    ]
                  }}
                >
                  <G transform={`translate(${width / 2}, ${height / 2})`}>
                    {
                      this.state.arcs.map(a => (
                        <Path
                          key={`arc_${a.index}`}
                          d={arc(a)}
                          fill={color(a.index)}
                        />
                      ))
                    }
                  </G>
                </AnimatedSvg>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </SafeAreaView>
    );
  }
}
