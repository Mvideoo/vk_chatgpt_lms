// Импорт основных библиотек React
import React from 'react';
// Импорт нового API рендеринга React 18+
import ReactDOM from 'react-dom/client';
// Импорт главного компонента приложения
import App from './App';
// Импорт VK Bridge для взаимодействия с VK Mini Apps
import bridge from '@vkontakte/vk-bridge';
// Импорт компонентов VKUI (опционально, так как в этом файле не используются)
import {Button, Div, Panel} from "@vkontakte/vkui";
// Импорт CSS-стилей для шрифтов и базовых стилей
import './fonts.css';

// Инициализация VK Mini App через VK Bridge
// Отправляет событие инициализации платформе VK
bridge.send('VKWebAppInit')
  .then(() => console.log('VK Mini App initialized')) // Успешная инициализация
  .catch(err => console.error('VK init error:', err)); // Обработка ошибок

// Создание корневого элемента React для рендеринга
// Используется новый API createRoot из React 18
const root = ReactDOM.createRoot(
  document.getElementById('root') // Получаем DOM-элемент с id 'root'
);

// Рендеринг основного компонента приложения
// StrictMode включен по умолчанию в новых проектах
root.render(
  <React.StrictMode>
    <App /> {/* Главный компонент приложения */}
  </React.StrictMode>
);
