import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {
  Route,
  BrowserRouter as Router,
  Routes
} from "react-router-dom";
import "../src/lang/i18n";
import Home from "./pages/Home.jsx";


function AppContent() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
          <Route path="/" element={<Home />} />
      </Routes>
    </div> 
  );
}

function App() {
  return (
    <Router>
      {/* <AuthProvider>
        <ThemeProvider>
          <FormDataProvider>
            <BluetoothProvider> */}
              <AppContent />
            {/* </BluetoothProvider>
          </FormDataProvider>
        </ThemeProvider>
      </AuthProvider> */}
    </Router>
  );
}
export default App
