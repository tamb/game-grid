import React from "react";
import { createGrid } from "./GameGridDemo";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: null
    };
  }

  componentDidMount() {
    const grid = createGrid();
    grid.render();
    this.setState({grid});
  }

  render() {
    return (
      <div>
        <h1>gamegrid</h1>
        <div>JavaScript</div>
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "25%",
              paddingLeft: "10%",
            }}
            id="grid"
          ></div>
          <div
            style={{
              width: "50%",
            }}
          >
            {this.state.grid && (
              <React.Fragment>
                <button onClick={this.state.grid.moveUp.bind(this.state.grid)} type="button">
                  UP
                </button>
                <button onClick={this.state.grid.moveRight.bind(this.state.grid)} type="button">
                  RIGHT
                </button>
                <button onClick={this.state.grid.moveDown.bind(this.state.grid)} type="button">
                  DOWN
                </button>
                <button onClick={this.state.grid.moveLeft.bind(this.state.grid)} type="button">
                  LEFT
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
