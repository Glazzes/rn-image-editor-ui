import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import ImageTest from './src/components/ImageTest';
import Selection from './src/components/Selection';
import {Colors} from './src/utils/colors';
import ColorSlider from './src/components/ColorSlider';

type StackParamList = {
  Home: undefined;
  Editor: undefined;
};

const Stack = createStackNavigator<StackParamList>();

const App = () => {
  useEffect(() => {
    console.log(Colors.hexToRgb('#3366ff'));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={ColorSlider} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
