import { AppRegistry } from 'react-native';
import App from './App';

// Register the app for web
AppRegistry.registerComponent('ErasGamesClient', () => App);

// Run the app
AppRegistry.runApplication('ErasGamesClient', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});