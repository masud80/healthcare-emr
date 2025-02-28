import "expo-dev-client";
import { registerRootComponent } from 'expo';
import './src/firebase/init'; // Import this first
import App from './app';


registerRootComponent(App);
