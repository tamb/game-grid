import "./styles.scss";
import "./demo.scss";

import GameGrid from "./GameGrid";
import { gridEventsEnum, tileTypeEnum } from "./enums.js";

function renderSpace() {
  return "<span>space</space>";
}

function renderBarrier() {
  return "<span>barrier</span>";
}

function renderInteractive() {
  return "<span>interactive</span>";
}

const g = new GameGrid("#app", {
  matrix: [
    [
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
      {
        key: "salt",
        type: tileTypeEnum.BARRIER,
        data: [["bonjour", "ourevfhfdjd"]],
        renderString: renderBarrier,
      },
      {
        key: "sugar",
        type: tileTypeEnum.BARRIER,
        data: [["hola", "adios"]],
        renderString: renderBarrier,
      },
    ],
    [
      {
        key: "pepper",
        type: tileTypeEnum.OPEN,
        data: [["hi", "bye"]],
        renderString: renderSpace,
      },
      {
        key: "vinegar",
        type: tileTypeEnum.OPEN,
        data: [["hey", "later"]],
        renderString: renderSpace,
      },
      {
        key: "sugar",
        type: tileTypeEnum.INTERACTIVE,
        data: [["hola", "adios"]],
        renderString: renderInteractive,
      },
      {
        key: "sugar",
        type: tileTypeEnum.INTERACTIVE,
        data: [["hola", "adios"]],
        renderString: renderInteractive,
      },
    ],
    [
      {
        key: "pepper",
        type: tileTypeEnum.OPEN,
        data: [["hi", "bye"]],
        renderString: renderSpace,
      },
      {
        key: "vinegar",
        type: tileTypeEnum.OPEN,
        data: [["hey", "later"]],
        renderString: renderSpace,
      },
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
      {
        key: "sugar",
        type: tileTypeEnum.BARRIER,
        data: [["hola", "adios"]],
        renderString: renderBarrier,
      },
    ],
    [
      {
        key: "pepper",
        type: tileTypeEnum.OPEN,
        data: [["hi", "bye"]],
        renderString: renderSpace,
      },
      {
        key: "vinegar",
        type: tileTypeEnum.BARRIER,
        data: [["hey", "later"]],
        renderString: renderBarrier,
      },
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
    ],
    [
      {
        key: "pepper",
        type: tileTypeEnum.OPEN,
        data: [["hi", "bye"]],
        renderString: renderSpace,
      },
      {
        key: "vinegar",
        type: tileTypeEnum.BARRIER,
        data: [["hey", "later"]],
        renderString: renderBarrier,
      },
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
      {
        key: "sugar",
        type: tileTypeEnum.OPEN,
        data: [["hola", "adios"]],
        renderString: renderSpace,
      },
    ],
  ],
  infinite_y: false,
});

g.render();
console.log(g);

Object.keys(gridEventsEnum).forEach((key) => {
  document.addEventListener(gridEventsEnum[key], (event) => {
    document
      .getElementById("event")
      .insertAdjacentHTML(
        "afterbegin",
        `<p>${event.type} - <small>${new Date().toLocaleTimeString()}</small></p>`
      );
  });
});

window.gamegrid = g;
