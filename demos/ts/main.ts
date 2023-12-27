import GameGrid from "../../dist/main";
import { attachListeners } from "./eventListeners";

const tileTypeEnum = {
  OPEN: "open",
  INTERACTIVE: "interactive",
  BARRIER: "barrier",
};

const matrix = [
  [
    {
      type: tileTypeEnum.OPEN,
      cellAttributes: [
        ["data-butt", "sauce"],
        ["class", "butt booty butty"],
      ],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.INTERACTIVE,
      cellAttributes: [["data-cell-type", "interactive"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
];

function createGrid() {
  console.log("building grid");
  return new GameGrid("#grid", {
    matrix,
    options: {
      infinite_y: true,
      infinite_x: true,
      clickable: true,
      arrow_controls: true,
      wasd_controls: true,
      callbacks: {
        LIMIT: function (x) {
          console.log("callback for LIMIT", x);
        },
        WRAP_Y: function (x) {
          console.log("callback WRAP_Y", x);
        },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const grid = createGrid();
  console.log(grid);
  grid.render();
  attachListeners();
});
