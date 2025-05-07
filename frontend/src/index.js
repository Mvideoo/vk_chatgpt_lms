import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import bridge from '@vkontakte/vk-bridge';
import {Button, Div, Panel} from "@vkontakte/vkui";
import './fonts.css';


bridge.send('VKWebAppInit')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);











