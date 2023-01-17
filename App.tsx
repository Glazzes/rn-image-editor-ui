import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import ImageTest from './src/components/ImageTest';
import Selection from './src/components/Selection';
import {Colors} from './src/utils/colors';
import ColorSlider from './src/components/ColorSlider';
import SelectionTesting from './src/components/SelectionTesting';
import MeasureTest from './src/components/MeasureTest';
import TextTesting from './src/components/TextTesting';
import ColorSliders from './src/components/ColorSliders';
import ThicknessSlider from './src/components/ThicknessSlider';

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
        <Stack.Screen name="Home" component={ThicknessSlider} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
