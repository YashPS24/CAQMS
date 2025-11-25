import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import "../src/lang/i18n";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar";

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
