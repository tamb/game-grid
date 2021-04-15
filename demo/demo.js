import "./demo.scss";

import GameGridHtml from "./../dist/main";

import { gridEventsEnum, tileTypeEnum } from "../src/old/enums";

console.log(GameGridHtml);

const matrix = [
  [
    {
      type: tileTypeEnum.OPEN,
      cellAttributes: [["data-butt", "sauce"]],
      renderFunction: function () {
        return document.createElement("input");
      },
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
];

const g = new GameGridHtml("#app", {
  matrix,
  options: {
    infinite_y: true,
    infinite_x: false,
  },
});

g.render();

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
