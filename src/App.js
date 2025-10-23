// App.js
import React from 'react';
import CustomerManagement from './components/CustomerManagement';
import Navbar from './components/Navbar.tsx';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />

      <main style={{ padding: '20px', marginTop: '60px' }}>
        <CustomerManagement />
      </main>

    
    </div>
  );
}

export default App;
