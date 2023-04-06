import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { TailwindProvider } from 'tailwindcss-react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppRegistry } from 'react-native';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <TailwindProvider>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator>
          <Stack.Screen name="home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TailwindProvider>
  );
}

//AppRegistry.registerComponent('MyApplication', () => App);
