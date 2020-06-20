import React from 'react';
import axios from 'axios'
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { IncidentLookupTable, Incident, IncidentGroup, Armed, Race } from 'police-shooting-data';
import './App.css';

const AllRaceVals: Race[] = [Race.White, Race.Black, Race.Hispanic, Race.Other];
const AllArmedVals: Armed[] = [Armed.Gun, Armed.Knife, Armed.Unarmed, Armed.Other];

const db = require('police-shooting-data/dist/db.json') as IncidentLookupTable;

function makePretty(data: Incident): Incident {
  switch (data.gender) {
    case "M": data.gender = "Male"; break;
    case "F": data.gender = "Female"; break;
    default: data.gender = "Unknown";
  }
  switch (data.race) {
    case "W": data.race = "White"; break;
    case "B": data.race = "Black"; break;
    case "H": data.race = "Hispanic"; break;
    case "N": data.race = "Native American"; break;
    case "O": data.race = "Other"; break;
    default: data.race = "Unknown";
  }
  return data;
}

async function loadIncident(id: number): Promise<Incident> {
    const data = await axios.get(`db/${id}.json`);
    return makePretty(data.data as Incident);
}

interface AppState {
  data: Incident | null;
  showInfo: boolean;
  showSettings: boolean;
  showDeficientRecords: boolean;
  showFullRecords: boolean;
  showAllContent: boolean;
  filters: {
    race: Set<Race>,
    armed: Set<Armed>
  }
}

class App extends React.Component<RouteComponentProps, AppState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      data: null,
      showInfo: false,
      showSettings: false,
      showDeficientRecords: false,
      showAllContent: false,
      showFullRecords: true,
      filters: {
        race: new Set(AllRaceVals),
        armed: new Set(AllArmedVals)
      }
    };
  }

  public componentDidMount() {
    if (this.getIdFromLocation()) {
      this.fetchContent();
    } else {
      this.reload();
    }
  }

  public async componentDidUpdate(prevProps: RouteComponentProps) {
    if (this.props.location !== prevProps.location) {
      this.fetchContent();
    }
  }

  public render() {
    return (
      <div className="App">
        {this.renderHeader()}
        {this.renderMain()}
      </div>
    );
  }

  private getIdFromLocation(): number | undefined {
    return parseInt((this.props.match.params as any)['incidentId'] as string);
  }

  private async fetchContent() {
    const id: number | undefined = this.getIdFromLocation();
    const data = id ? await loadIncident(id) : null;
    this.setState({ data });
  }

  private renderHeader(): JSX.Element {
    return <header className="App-header">
      {this.renderSettingsAndInfo()}
      <p>
        Fatally Shot by Police, USA 2019
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

  private renderSettingsAndInfo(): JSX.Element {
    return <div>
      {!this.state.showInfo && <div className="App-header-settings-button" onClick={() => this.setState({
        ...this.state,
        showInfo: false,
        showSettings: !this.state.showSettings
      })}></div>}
      {!this.state.showSettings && <div className="App-header-info-button" onClick={() => this.setState({
        ...this.state,
        showInfo: !this.state.showInfo,
        showSettings: false
      })}></div>}
      {this.state.showSettings && this.renderSettings()}
      {this.state.showInfo && this.renderInfo()}
    </div>;
  }

  private renderSettings(): JSX.Element {
    return <div className="App-popout">
      <p>Settings</p>
      <div className="App-popout-filter" onClick={(evt) => this.setState({ ...this.state, showFullRecords: !this.state.showFullRecords })}>
        <input type="checkbox" checked={this.state.showFullRecords} readOnly={true}/>
        Show full records
      </div>
      <div className="App-popout-filter" onClick={(evt) => this.setState({ ...this.state, showDeficientRecords: !this.state.showDeficientRecords })}>
        <input type="checkbox" checked={this.state.showDeficientRecords} readOnly={true}/>
        Show incomplete records
      </div>
      <div className="App-popout-filter" onClick={(evt) => this.setState({ ...this.state, showAllContent: !this.state.showAllContent })}>
        <input type="checkbox" checked={this.state.showAllContent} readOnly={true}/>
        Show all content
      </div>
    </div>;
  }

  private renderInfo(): JSX.Element {
    return <div className="App-popout">
      <p>Information</p>
      <p>App: <a href="https://github.com/oreganolisk/police-shootings">https://github.com/oreganolisk/police-shootings</a></p>
      <p>Data: <a href="https://github.com/oreganolisk/police-shooting-data">https://github.com/oreganolisk/police-shooting-data</a></p>
      <p>
        The records displayed in this app are from the <a href="https://github.com/washingtonpost/data-police-shootings"></a> 
        Washington Post police shootings database, licensed as Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). 
        Additional information is supplemented from the <a href="https://mappingpoliceviolence.org/">Mapping Police Violence</a> project, 
        and from searching Youtube and news sites.
      </p>
      <p>
        By default, records without sufficient content are not chosen for display. When this happens the randomizing algorithm takes the coverage 
        of each combination of filters into account to ensure that results are not biased by race or armament status. See settings to show
        all records.
      </p>
      <p>
        Accuracy of records is not guaranteed, and minimal effort has been expended on curation.
      </p>
    </div>;
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
    var total = db.groups.map(grp => grp.n).reduce((a, b) => a + b, 0);
    const matched = this.getGroupsFromDb().map(grp => grp.n).reduce((a, b) => a + b, 0);
    return <p>
      {matched} out of {total}  people match your filters ({Math.floor(matched*100/total)}%)
    </p>
  }

  private renderMain(): JSX.Element {
    const data = this.state.data;
    if (data) {
      return <main>
        <div className="App-main-content">
          <p className="App-main-name">{data.name}</p>
          {this.renderMetadata()}
          <img className="App-main-photo" src={data.photo}/>
          <p className="App-main-story">{data.description}</p>
          <p><a className="App-main-newslink" href={data.newsLink}>News story</a></p>
          {this.renderVideoEmbed()}
        </div>
      </main>
    } else {
      return <main>No result</main>
    }
  }

  private renderMetadata(): JSX.Element {
    const data = this.state.data;
    if (data) {
      if (this.state.showAllContent) {
        return <table className="App-main-metadata">
          {Object.keys(data).map(key => <tr><td>{key}:</td><td>{(data as any)[key]}</td></tr>)}
        </table>
      } else {
        return <table className="App-main-metadata">
          <tr><td>Age:</td><td>{data.age}</td></tr>
          <tr><td>Gender:</td><td>{data.gender}</td></tr>
          <tr><td>Armed:</td><td>{data.armed}</td></tr>
          <tr><td>Race:</td><td>{data.race}</td></tr>
          <tr><td>Date:</td><td>{data.date}</td></tr>
          <tr><td>Location:</td><td>{data.location}</td></tr>
        </table>
      }
    }
    else return <p>No metadata</p>;
  }

  private renderVideoEmbed(): JSX.Element | null {
    if (this.state.data?.youtubeEmbed) {
      return <iframe
        className="App-main-youtube"
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${this.state.data.youtubeEmbed}`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />;
    } else if (this.state.data?.iframeEmbed) {
      return <div dangerouslySetInnerHTML={{__html: this.state.data?.iframeEmbed}}/>
    } else {
      return null;
    }
  }

  private getGroupsFromDb(): IncidentGroup[] {
    const f = this.state.filters;
    const filtered = db.groups.filter(grp => 
      (f.race.has(grp.race)) && (f.armed.has(grp.armed))
    );
    return filtered;
  }

  private chooseFromFiltered(): number | null {
    const filtered = this.getGroupsFromDb();
    if (filtered.length === 0) return null;
    var n = filtered.map(grp => grp.n).reduce((a, b) => a + b);
    var r = Math.floor(Math.random() * n);
    for (var grp of filtered) {
      if (r < grp.n) {
        const candidates = [];
        if (this.state.showFullRecords) candidates.push(...grp.ids);
        if (this.state.showDeficientRecords) candidates.push(...grp.idsMissingContent);
        if (candidates.length === 0) return null;
        return candidates[Math.floor(candidates.length * Math.random())];
      } else {
        r -= grp.n;
      }
    }
    throw "Should never be reached";
  }

  private async reload() {
    const id = this.chooseFromFiltered()
    this.props.history.push(`/${id}`);
  }
}

export default withRouter(App);
