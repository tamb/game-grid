import "./demo.scss";

import GameGridHtml from "./../dist/main";
import {gridEventsEnum} from "./../src/enums";

// import { gridEventsEnum, tileTypeEnum } from "../src/old/enums";
const tileTypeEnum = {
  OPEN: "open",
  INTERACTIVE: "interactive",
  BARRIER: "barrier",
};

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
// const $clickable = document.querySelector('[data-ref="Checkbox.clickable"]');
const $infinite_x = document.querySelector('[data-ref="Checkbox.infinite_x"]');
const $infinite_y = document.querySelector('[data-ref="Checkbox.infinite_y"]');
const $arrow_controls = document.querySelector(
  '[data-ref="Checkbox.arrow_controls"]'
);
const $wasd_controls = document.querySelector(
  '[data-ref="Checkbox.wasd_controls"]'
);

const g = new GameGridHtml("#app", {
  matrix,
  options: {
    infinite_y: $infinite_y.checked,
    infinite_x: $infinite_x.checked,
    // clickable: $clickable.checked,
    arrow_controls: $arrow_controls.checked,
    wasd_controls: $wasd_controls.checked,
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
window.addEventListener("gamegridhtml:move:barrier", (e) => {
  console.log(e);
});
window.gamegrid = g;

const form = document.querySelector('[data-ref="Form.settings"]');
const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));

checkboxes.forEach((cb) => {
  cb.addEventListener("change", () => {
    console.log($wasd_controls.checked)
    g.setOptions({
      infinite_y: $infinite_y.checked,
      infinite_x: $infinite_x.checked,
      // clickable: $clickable.checked,
      arrow_controls: $arrow_controls.checked,
      wasd_controls: $wasd_controls.checked,
    });
  });
});

Object.keys(gridEventsEnum).forEach(function(key) {
  window.addEventListener(gridEventsEnum[key], function(event){
    console.log(event);
    document.querySelector("#event").textContent = JSON.stringify(event, undefined, 4);
  });
});