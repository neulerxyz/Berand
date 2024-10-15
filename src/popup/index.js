// src/popup/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import PopupComponent from './components/PopupComponent';
import 'Shared/styles/common.css';
import './styles/popup.css';
import '../i18n';

ReactDOM.render(<PopupComponent />, document.getElementById('root'));

