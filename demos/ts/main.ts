import GameGrid from "../../dist/main";

const tileTypeEnum = {
  OPEN: "open",
  INTERACTIVE: "interactive",
  BARRIER: "barrier",
};

const matrix = [
  [
    {
      type: tileTypeEnum.OPEN,
      cellAttributes: [["data-butt", "sauce"]],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.INTERACTIVE,
      cellAttributes: [["data-cell-type", "interactive"]],
    },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
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
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [["data-cell-type", "barrier"]],
    },
    { type: tileTypeEnum.OPEN },
  ],
];

function createGrid() {
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

createGrid();
