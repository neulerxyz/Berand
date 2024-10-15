// src/signup/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import SignupComponent from './components/SignupComponent';
import 'Shared/styles/common.css';
import './styles/signup.css'; 
import '../i18n';

ReactDOM.render(
  <React.StrictMode>
    <SignupComponent />
  </React.StrictMode>,
  document.getElementById('root')
);
