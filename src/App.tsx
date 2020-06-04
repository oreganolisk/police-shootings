import React from 'react';
import axios from 'axios'
import './App.css';

enum Race {
  White = 0,
  Black = 1,
  Hispanic = 2,
  Other = 3
};
const AllRaceVals: Race[] = [Race.White, Race.Black, Race.Hispanic, Race.Other];

enum Armed {
  Gun = 0,
  Knife = 1,
  Unarmed = 2,
  Other = 3
}
const AllArmedVals: Armed[] = [Armed.Gun, Armed.Knife, Armed.Unarmed, Armed.Other];

interface IncidentMetadata {
  id: number,
  race: Race,
  armed: Armed
}

interface IncidentData {
  name: string;
  age: number;
  race: string;
  armed: string;
  photo: string;
  summary: string;
  newslink: string;
  youtube: string;
}

const db: IncidentMetadata[] = (require('./db') as number[][])
  .map(el => ({ id: el[0], race: el[1], armed: el[2]}));

async function loadIncidentData(id: number): Promise<IncidentData> {
  try {
    const data = await axios.get(`db/${id}.json`);
    return data.data as IncidentData;
  } catch {
    const data = await axios.get(`db/0.json`);
    data.data.name += " (default data, fetch failed)";
    return data.data as IncidentData
  }
}

interface AppProps {
}

interface AppState {
  metadata: IncidentMetadata | null;
  data: IncidentData | null;
  filters: {
    race: Set<Race>,
    armed: Set<Armed>
  }
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      metadata: null,
      data: null,
      filters: {
        race: new Set(AllRaceVals),
        armed: new Set(AllArmedVals)
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
        Killed by Police, USA 2015-2020
      </p>
      <div>
        <div className="App-header-filtergroup">
          {AllRaceVals.map(race => this.renderRaceFilter(race))}
        </div>
        <div className="App-header-filtergroup">
          {AllArmedVals.map(armed => this.renderArmedFilter(armed))}
        </div>
      </div>
      <button className="App-button" onClick={() => this.reload()}>
        Reload
      </button>
      {this.renderStats()}
    </header>
  }

  private renderRaceFilter(race: Race): JSX.Element {
    const str = {
      [Race.White]: "White",
      [Race.Black]: "Black",
      [Race.Hispanic]: "Hispanic",
      [Race.Other]: "Other"
    }[race];
    const newSet = new Set(this.state.filters.race);
    if (!newSet.delete(race))
      newSet.add(race);

    return <div
      className="App-header-filter"
      onClick={(evt) => this.setState({
        ...this.state,
        filters: {
          ...this.state.filters,
          race: newSet
        }
      })}>
      <input type="checkbox" checked={!newSet.has(race)} readOnly={true}/>
      {str}
    </div>
  }

  private renderArmedFilter(armed: Armed): JSX.Element {
    const str = {
      [Armed.Gun]: "Gun",
      [Armed.Knife]: "Knife",
      [Armed.Unarmed]: "Unarmed",
      [Armed.Other]: "Other"
    }[armed];
    const newSet = new Set(this.state.filters.armed);
    if (!newSet.delete(armed))
      newSet.add(armed);

    return <div
      className="App-header-filter"
      onClick={(evt) => this.setState({
        ...this.state,
        filters: {
          ...this.state.filters,
          armed: newSet
        }
      })}>
      <input type="checkbox" checked={!newSet.has(armed)} readOnly={true}/>
      {str}
    </div>
  }

  private renderStats(): JSX.Element {
    const total = db.length;
    const matched = this.getFilteredFromDb().length;
    return <p>
      {matched} out of {total}  people match your filters ({Math.floor(matched*100/total)}%)
    </p>
  }

  private renderMain(): JSX.Element {
    const meta = this.state.metadata;
    const data = this.state.data;
    if (meta && data) {
      return <main>
        <div className="App-main-content">
          <p className="App-main-name">{data.name}</p>
          <p>{data.armed}, {data.race}, {data.age}</p>
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

  private getFilteredFromDb(): IncidentMetadata[] {
    const f = this.state.filters;
    const filtered = db.filter(row => 
      (f.race.has(row.race)) && (f.armed.has(row.armed))
    );
    return filtered;
  }

  private chooseFromFiltered(): IncidentMetadata | null {
    const filtered = this.getFilteredFromDb();
    if (filtered.length === 0) return null;
    const i = Math.floor(Math.random() * filtered.length);
    return filtered[i];
  }

  private async reload() {
    const metadata = this.chooseFromFiltered()
    const data = metadata ? await loadIncidentData(metadata.id) : null;
    this.setState({ metadata, data });
  }
}

export default App;
