/// <reference types="jest" />

import GameGridHtml from "./index";

const matrix = [
  [
    { type: "open", cellAttributes: [["data-test", "yankee"]] },
    {
      type: "open",
      renderFunction() {
        return document.createElement("input");
      },
    },
    { type: "open" },
  ],
  [{ type: "open" }, { type: "open" }, { type: "open" }],
  [{ type: "open" }, { type: "open" }, { type: "open" }],
];

describe("GameGridHtml class", () => {
  let workingGrid: any = null;
  let defaultOptions: any = null;
  let defaultState: any = null;

  beforeEach(() => {
    document.body.insertAdjacentHTML("afterbegin", '<div id="root"></div>');
    workingGrid = new GameGridHtml("#root", { matrix });
    defaultOptions = {
      active_class: "gg-active",
      arrow_controls: true,
      wasd_controls: true,
      container_class: "",
      infinite_x: true,
      infinite_y: true,
      rewind_limit: 20,
      block_on_type: ["barrier"],
      interact_on_type: ["interactive"],
      move_on_type: ["open"],
    };
    defaultState = {
      active_coords: [0, 0],
      prev_coords: [0, 0],
      current_direction: "",
      rendered: false,
    };
  });
  // instantiation tests
  test("options are set correctly", () => {
    const fakeGrid = new GameGridHtml("#root", {
      matrix,
      options: {
        infinite_x: false,
      },
    });

    expect(fakeGrid.getOptions().infinite_x).toBe(false);
  });
  test("default options exist", () => {
    expect(workingGrid.options).toEqual(defaultOptions);
  });
  test("container ref is always made", () => {
    expect(workingGrid.getRefs().container.id).toMatch("root");
  });
  test("refs are made", () => {
    workingGrid.render();
    expect(workingGrid.getRefs().rows.length).toBe(3),
    expect(workingGrid.getRefs().cells[0].length).toBe(3);
  });
  test("initial state defaults correctly", () => {
    expect(workingGrid.getState()).toEqual(defaultState);
  });
  test("initial state accepts values", () => {
    const newState = {
      current_direction: "up",
      active_coords: [1, 1],
    };
    const newGrid = new GameGridHtml("#root", {
      matrix,
      state: newState,
    });

    expect(newGrid.getState()).toEqual({
      current_direction: "up",
      rendered: false,
      prev_coords: [0, 0],
      active_coords: [1, 1],
    });
  });

  //internal workings
  // test("move is added to moves", () => {});
  // test("handlers attach on instantiation", () => {});
  // test("hitting limit fires events", () => {});
  // test("hitting interactive fires interactive", () => {});
  // test("hitting barrier fires barrier", () => {});
  // test("hitting custom type fires custom type event", () => {});

  // // api tests
  // test("destroy removes event listeners", () => {});
  test("getState return full state", () => {
    expect(workingGrid.getState()).toEqual(defaultState);
  });
  // test("setMatrix applies given matrix", () => {});
  test("setStateSync updates whole state correctly", () => {
    const newState = {
      active_coords: [0, 0],
      prev_coords: [0, 0],
      current_direction: "",
      rendered: false,
    };
    workingGrid.setStateSync(newState);
    expect(workingGrid.getState()).toEqual(newState);
  });
  test("setStateSync updates partial state correctly", () => {
    workingGrid.setStateSync({current_direction: "blueberry"});
    expect(workingGrid.getState().current_direction).toMatch("blueberry");
    expect(workingGrid.getState().rendered).toBe(false);
  });
  // test("render outputs full grid", () => {});
  test("setFocusToContainer sets focus to container", () => {
    workingGrid.setFocusToContainer();
    expect(document.activeElement).toEqual(workingGrid.getRefs().container);
  });
  // test("setFocusToCell sets to given cell", () => {});
  // test("setFocusToCell defaults to active_coords", () => {});

  // // move API
  // test("moveLeft unblocked goes left", () => {});
  // test("moveLeft blocked stays", () => {});
  // test("moveRight unblocked goes left", () => {});
  // test("moveRight blocked stays", () => {});
  // test("moveUp unblocked goes left", () => {});
  // test("moveUp blocked stays", () => {});
  // test("moveDown unblocked goes left", () => {});
  // test("moveDown blocked stays", () => {});

  // // render tests
  // test("container classes are applied", () => {});
  // test("row classes are applied", () => {});
  // test("cell classes are applied", () => {});
  // test("cell width is correct", () => {});
  // test("cell content renders", () => {});
  // test("default row attributes rendered", () => {});
  // test("default cell attributes are rendered", () => {});
});
