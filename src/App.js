// App.js
import React from 'react';
import CustomerManagement from './components/CustomerManagement';
import Navbar from './components/Navbar.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
     {/* ToastContainer with center position */}
      <ToastContainer
        position="top-center"  // Changed from "top-right" to "top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <main style={{ padding: '20px', marginTop: '60px' }}>
        <CustomerManagement />
      </main>

    
    </div>
  );
}

export default App;
