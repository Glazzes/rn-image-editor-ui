import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import ThicknessSlider from './src/components/ThicknessSlider';
import CurveTest from './src/components/CurveTest';
import ImageSticker from './src/components/ImageSticker';
import ColorSliders from './src/components/ColorSliders';
import ImageTest from './src/components/ImageTest';
import Selection from './src/components/Selection';
import MeasureTest from './src/components/MeasureTest';
import HSLSpectrum from './src/components/HSLSpectrum';
import ColorGrid from './src/components/ColorGrid';
import ColorPicker from './src/components/colorPicker/ColorPicker';

type StackParamList = {
  Home: undefined;
  Editor: undefined;
};

const Stack = createStackNavigator<StackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={ColorPicker} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
