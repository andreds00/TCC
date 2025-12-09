// index.js
import 'expo-dev-client';
import { registerRootComponent } from 'expo';
import App from './App'; // ajuste se o seu App estiver em outra pasta, ex: './src/App'
import { Buffer } from "buffer";

global.Buffer = global.Buffer || Buffer;


registerRootComponent(App);
