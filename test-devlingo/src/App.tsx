import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Application</h1>
        <p>Please login to continue</p>
        <button>Login</button>
        <button>Forgot Password?</button>
        <div>
          <h2>Dashboard</h2>
          <p>Your profile information</p>
          <span>User Settings</span>
        </div>
      </header>
    </div>
  );
}

export default App;
