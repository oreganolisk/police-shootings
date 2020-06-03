import React from 'react';
import axios from 'axios'
import './App.css';

interface IncidentMetadata {
  id: string,
  race: string,
  armed: boolean
}

interface IncidentData {
  name: string;
  age: number;
}

const db: { rows: IncidentMetadata[] } = require('./db');

function getRandomDbIndex() {
  return Math.floor(Math.random() * db.rows.length);
}

async function loadIncidentData(id: string): Promise<IncidentData> {
  const data = await axios.get(`db/${id}.json`);
  return data.data as IncidentData;
}

interface AppProps {
}

interface AppState {
  metadata: IncidentMetadata | null;
  data: IncidentData | null;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      metadata: null,
      data: null
    };
  }

  public componentDidMount() {
    this.reload();
  }

  public render() {
    return (
      <div className="App">
        {this.renderHeader()}
        {this.renderMain()}
      </div>
    );
  }

  private renderHeader(): JSX.Element {
    return <header className="App-header">
        <p>
          Random Violence
        </p>
        <button className="App-button" onClick={() => this.reload()}>
          Reload
        </button>
    </header>
  }

  private renderMain(): JSX.Element {
    const meta = this.state.metadata;
    const data = this.state.data;
    if (meta && data) {
    return <main>
      <div>
        <p>id: {meta.id}</p>
        <p>race: {meta.race}</p>
        <p>armed: {meta.armed ? "yes" : "no"}</p>
        <p>name: {data.name}</p>
        <p>age: {data.age}</p>
      </div>
    </main>
    } else {
      return <main>Loading...</main>
    }
  }

  private async reload() {
    const dbIndex = getRandomDbIndex();
    const metadata = db.rows[dbIndex];
    const data = await loadIncidentData(metadata.id);
    this.setState({ metadata, data });
  }
}

export default App;
