import React from 'react';
import {LogBox} from 'react-native';
LogBox.ignoreLogs(['tf.nonMaxSuppression']); // Ignore log notification by message

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen'
import ImageScreen from './screens/ImageScreen'
import { DetectorContextProvider } from './utils/DetectorContext';

const Stack = createStackNavigator();


export default function App() {

  return ( 
    <DetectorContextProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Image" component={ImageScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </DetectorContextProvider>
  )
}
