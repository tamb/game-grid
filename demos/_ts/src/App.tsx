import React from "react";
import { createGrid } from "./GameGridDemo";

function App() {
  React.useEffect(() => {
    const x = createGrid();
    x.render();
  }, []);
  return (
    <div>
      <h1>gamegrid</h1>
      <div>typescript</div>
      <div id="grid"></div>
    </div>
  );
}

export default App;
