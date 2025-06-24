import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PrintPreviewWithReact } from './components/PrintPreviewWithReact';
import './index.css';

// 简单路由逻辑
const urlParams = new URLSearchParams(window.location.search);
const previewMode = urlParams.get('preview');

let ComponentToRender: React.ComponentType = App;

switch (previewMode) {
  case 'react':
    ComponentToRender = PrintPreviewWithReact;
    break;
  default:
    ComponentToRender = App;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ComponentToRender />
  </StrictMode>
);
