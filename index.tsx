import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('App', () => App);

// Run the application
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});