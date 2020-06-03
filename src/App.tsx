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
  photo: string;
  summary: string;
  newslink: string;
  youtube: string;
}

const db: { rows: IncidentMetadata[] } = require('./db');

async function loadIncidentData(id: string): Promise<IncidentData> {
  const data = await axios.get(`db/${id}.json`);
  return data.data as IncidentData;
}

interface AppProps {
}

interface AppState {
  metadata: IncidentMetadata | null;
  data: IncidentData | null;
  filters: { [id: string]: boolean }
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      metadata: null,
      data: null,
      filters: {
        white: true,
        black: true,
        armed: true,
        unarmed: true
      }
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
      <div>
        <div className="App-header-filtergroup">
          {this.renderFilter("Black", "black")}
          {this.renderFilter("White", "white")}
        </div>
        <div className="App-header-filtergroup">
          {this.renderFilter("Armed", "armed")}
          {this.renderFilter("Unarmed", "unarmed")}
        </div>
      </div>
      <button className="App-button" onClick={() => this.reload()}>
        Reload
        </button>
    </header>
  }

  private renderFilter(name: string, id: string): JSX.Element {
    return <div
      className="App-header-filter"
      onClick={(evt) => this.setState({
        ...this.state,
        filters: {
          ...this.state.filters,
          [id]: !this.state.filters[id]
        }
      })}>
      <input type="checkbox" checked={this.state.filters[id]} readOnly={true}/>
      {name}
    </div>
  }

  private renderMain(): JSX.Element {
    const meta = this.state.metadata;
    const data = this.state.data;
    if (meta && data) {
      return <main>
        <div className="App-main-content">
          <p className="App-main-name">{data.name}</p>
          <p>{meta.armed ? "armed" : "unarmed"}, {meta.race}, {data.age}</p>
          <img className="App-main-photo" src={data.photo}/>
          <p className="App-main-story">{data.summary}</p>
          <iframe
            className="App-main-youtube"
            width="560"
            height="315"
            src={data.youtube}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </main>
    } else {
      return <main>No result</main>
    }
  }

  private chooseFromDb(): IncidentMetadata | null {
    const f = this.state.filters;
    const filtered = db.rows.filter(row => 
      (f.armed && row.armed || f.unarmed && !row.armed)
      && (f.white && row.race === "white" || f.black && row.race === "black")
    );
    if (filtered.length === 0) return null;
    const i = Math.floor(Math.random() * filtered.length);
    return filtered[i];
  }

  private async reload() {
    const metadata = this.chooseFromDb()
    const data = metadata ? await loadIncidentData(metadata.id) : null;
    this.setState({ metadata, data });
  }
}

export default App;
