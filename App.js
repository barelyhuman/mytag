import React from 'react';
import {LogBox} from 'react-native';
LogBox.ignoreLogs(['tf.nonMaxSuppression']); // Ignore log notification by message

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen'
import ImageScreen from './screens/ImageScreen'
import { CategoriesContextProvider } from './utils/CategoriesContext';

const Stack = createStackNavigator();

const MyTheme = {
  dark: false,
  colors: {
    primary: 'rgb(255, 45, 85)',
    background: 'rgb(237, 240, 237)',
    card: '#7fe7cc',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(199, 19, 204)',
    notification: 'rgb(255, 69, 58)',
  },
};

export default function App() {

  return ( 
    <CategoriesContextProvider>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid}}
          >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Image" component={ImageScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </CategoriesContextProvider>
  )
}
