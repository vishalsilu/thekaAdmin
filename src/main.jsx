import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from "react-redux"
import store from './Redux/Store.js'
import { fetchSiteData } from './Redux/thunks/siteDataThunks';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
      <App />
    </GoogleReCaptchaProvider>
   </Provider>
  </StrictMode>,
)

// Ensure site data is available for admin UI immediately
store.dispatch(fetchSiteData());
