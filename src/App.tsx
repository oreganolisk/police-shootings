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

const db: IncidentMetadata[] = (require('./db') as number[][])
  .map(el => ({ id: el[0], armed: el[1], race: el[2]}));

interface IncidentData {
  id: number,
  name: string;
  age: number;
  race: string;
  armed: string;
  date: string,
  manner_of_death: string,
  gender: string,
  city: string,
  state: string,
  signs_of_mental_illness: string,
  threat_level: string,
  flee: string,
  body_camera: string

  // Props that aren't in the data yet
  photo?: string;
  summary?: string;
  newslink?: string;
  youtube?: string;
}

function withDefaults(data: IncidentData): IncidentData {
  data.photo = data.photo || "https://i.insider.com/54806a086bb3f763254d6d6a?width=1100&format=jpeg&auto=webp";
  data.summary = data.summary ||
    "On July 17, 2014, Eric Garner died in the New York City borough of Staten Island after Daniel Pantaleo, \
    a New York City Police Department (NYPD) officer, put him in a chokehold while arresting him. Video footage \
    of the incident generated widespread national attention and raised questions about the appropriate use of \
    force by law enforcement.";
  data.newslink = data.newslink || "https://en.wikipedia.org/wiki/Death_of_Eric_Garner";
  data.youtube = data.youtube || "https://www.youtube.com/embed/_s8JklrBSlk";
  return data;
}

async function loadIncidentData(id: number): Promise<IncidentData> {
    const data = await axios.get(`db/${id}.json`);
    return withDefaults(data.data as IncidentData);
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
