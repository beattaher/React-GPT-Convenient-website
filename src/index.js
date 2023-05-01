import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import 'antd/dist/reset.css';
// 再导入全局样式文件，防止样式覆盖！
import './index.scss'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <App />
  
);


