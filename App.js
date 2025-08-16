import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DrawingScreen from './src/screens/DrawingScreen';
import CompletionScreen from './src/screens/CompletionScreen';
import FontPreviewScreen from './src/screens/FontPreviewScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Drawing" component={DrawingScreen} />
          <Stack.Screen name="Completion" component={CompletionScreen} />
          <Stack.Screen name="FontPreview" component={FontPreviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
