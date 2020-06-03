import React from 'react';
import logo from './logo.svg';
import './App.css';

const db: {
  rows: {
    id: string,
    race: string,
    armed: boolean
  }[]
} = require('./db');

function getRandomDbIndex() {
  return Math.floor(Math.random() * db.rows.length);
}

interface AppProps {
}

interface AppState {
  dbIndex: number;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      dbIndex: getRandomDbIndex()
    };
  }

  public render() {
    const data = db.rows[this.state.dbIndex];
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Random Violence
          </p>
          <button className="App-button" onClick={() => this.reroll()}>
            Re-roll
          </button>
        </header>
        <main>
        <p>
            {data.id} - race: {data.race} armed: {data.armed ? "yes" : "no"}
          </p>
        </main>
      </div>
    );
  }

  private reroll() {
    this.setState({
      dbIndex: getRandomDbIndex()
    });
  }
}

export default App;
