import React from 'react';
import logo from './logo.svg';
import './App.css';

const db = require('./db');

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {Object.keys(db).map(key => {
            return <p>{key} - {JSON.stringify(db[key])}</p>
          })}
        </p>
      </header>
    </div>
  );
}

export default App;
