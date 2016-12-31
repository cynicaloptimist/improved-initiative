import * as React from "react";

interface Combatant {
  Id: number;
  Name: string;
  Hp: string;
  Initiative: string;
}

class InitiativeList extends React.Component<{ data: Combatant [] }, {} > {
  render() {
    var combatantRows = this.props.data.map((c: Combatant) => (
      <li key={c.Id}>
        <span>{c.Initiative}</span>
        <span>{c.Name}</span>
        <span>{c.Hp}</span>
      </li>
    ));

    return (
      <div className="App">
        {combatantRows}
      </div>
    );
  }
}

class App extends React.Component<any, any> {
  render() {
    return (
      <InitiativeList data = {this.state.combatants} />
    )
  }

  state = {
    combatants: [{
      Id: 0,
      Initiative: "0",
      Name: "Foo",
      Hp: "10/10"
    }] as Combatant[]
  };
  
  
}

export default App;
