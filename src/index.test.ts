/// <reference types="jest" />

import GameGridHtml from "./index";

describe("GameGridHtml class", () => {
  // instantiation tests
  test("options are set correctly", () => {});
  test("refs are made");
  test("initial state defaults correctly");
  test("initial state accepts values");

  //internal workings
  test("move is added to moves");
  test("handlers attach on instantiation");
  test("hitting limit fires events");
  test("hitting interactive fires interactive");
  test("hitting barrier fires barrier");
  test("hitting custom type fires custom type event");

  // api tests
  test("destroy removes event listeners");
  test("getState return full state");
  test("setMatrix applies given matrix");
  test("setStateSync updates whole state correctly");
  test("setStateSync updates partial state correctly");
  test("render outputs full grid");
  test("setFocusToContainer sets focus to container");
  test("setFocusToCell sets to given cell");
  test("setFocusToCell defaults to active_coords");

  // move API
  test("moveLeft unblocked goes left");
  test("moveLeft blocked stays");
  test("moveRight unblocked goes left");
  test("moveRight blocked stays");
  test("moveUp unblocked goes left");
  test("moveUp blocked stays");
  test("moveDown unblocked goes left");
  test("moveDown blocked stays");

  // render tests
  test("container classes are applied");
  test("row classes are applied");
  test("cell classes are applied");
  test("cell width is correct");
  test("cell content renders");
  test("default row attributes rendered");
  test("default cell attributes are rendered");
});
