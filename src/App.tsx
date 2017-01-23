import * as React from "react";
import { Combatant } from "./Combatant";
import { InitiativeList } from "./InitiativeList";

export default class App extends React.Component<any, any> {
  render() {
    return (
      <InitiativeList data={this.state.combatants} />
    )
  }

  state = {
    combatants: [{
      Id: 0,
      Initiative: "1",
      Name: "Alice",
      Hp: "10/10"
    },
    {
      Id: 1,
      Initiative: "0",
      Name: "Bob",
      Hp: "12/12"
    }] as Combatant[]
  };
}