import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from "./context/protectedRoutes";
import { FoodAppProvider } from './hooks/appProvider';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <FoodAppProvider>
          <App />
        </FoodAppProvider>
      </Router>
    </AuthProvider>
    <Toaster containerStyle={{ top: '100px' }} />
  </React.StrictMode>,
)
