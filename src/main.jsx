import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import '@fontsource-variable/inter'
import App from './App.jsx'
import { AdminAuthProvider } from './admin/auth/AdminAuthContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { LoginPromptProvider } from './auth/LoginPromptContext.jsx'
import { CartProvider } from './cart/CartContext.jsx'

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <LoginPromptProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </LoginPromptProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
