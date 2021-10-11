import React from "react";
import { createGrid } from "./GameGridDemo";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.grid = null;
  }

  componentDidMount() {
    this.grid = createGrid();
    this.grid.render();
  }

  render() {
    return (
      <div>
        <h1>gamegrid</h1>
        <div>JavaScript</div>
        <div id="grid"></div>
      </div>
    );
  }
}

export default App;
