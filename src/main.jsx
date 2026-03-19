import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Initialize Telegram WebApp
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  window.Telegram.WebApp.expand()
  window.Telegram.WebApp.setHeaderColor('#0D0D0D')
  window.Telegram.WebApp.setBackgroundColor('#0D0D0D')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
