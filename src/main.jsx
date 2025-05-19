import { scan } from "react-scan";
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

scan({
  enabled: false,
});

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)
