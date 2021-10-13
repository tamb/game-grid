import React from "react";
import { createGrid } from "./GameGridDemo";

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: null,
    };
  }

  componentDidMount() {
    const grid = createGrid();
    grid.render();
    this.setState({ grid });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>gamegrid</h1>
            <div>JavaScript</div>
          </div>
          <div className="col-6">
            <div id="grid"></div>
          </div>
          <div className="col-6">
            {this.state.grid && (
              <div className="d-flex flex-wrap justify-content-center">
                <button
                  className="w-75 m-3 btn btn-primary"
                  onClick={this.state.grid.moveUp.bind(this.state.grid)}
                  type="button"
                >
                  UP
                </button>
                <button
                  className="w-50 btn btn-primary"
                  onClick={this.state.grid.moveLeft.bind(this.state.grid)}
                  type="button"
                >
                  LEFT
                </button>
                <button
                  className="w-50 btn btn-primary"
                  onClick={this.state.grid.moveRight.bind(this.state.grid)}
                  type="button"
                >
                  RIGHT
                </button>
                <button
                  className="w-75 m-3 btn btn-primary"
                  onClick={this.state.grid.moveDown.bind(this.state.grid)}
                  type="button"
                >
                  DOWN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
