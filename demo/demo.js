import "./styles.scss";
import "./demo.scss";

import GameGrid2D from "../src/index";
import { gridEventsEnum, tileTypeEnum } from "../src/enums.js";

const matrix = [
  [[{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}]],
  [[{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}]],
  [[{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}]],
  [[{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}], [{type: tileTypeEnum.OPEN}]],
];

const g = new GameGrid2D("#app", {
  matrix,
  options: {
    infinite_y: true,
    infinite_x: false,
  },
});

g.init();
console.log(g);
document.addEventListener("move", (event) => {
  document
    .getElementById("event")
    .insertAdjacentHTML(
      "afterbegin",
      `<p>${
        event.detail.active_coords
      } - <small>${new Date().toLocaleTimeString()}</small></p>`
    );
});

window.gamegrid = g;
