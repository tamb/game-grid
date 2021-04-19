/// <reference types="jest" />

import GameGridHtml from "./index";
document.body.insertAdjacentHTML("afterbegin", '<div id="root"></div>');

const matrix = [
  [
    { type: "open", cellAttributes: [["data-test", "yankee"]] },
    {
      type: "open",
      cellAttributes: [
        ["data-butt", "doody"],
        ["data-doody", "butt"],
      ],
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
    workingGrid = null;
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
      moves: [[0, 0]],
    };
  });

  afterEach(() => {
    workingGrid = null;
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
      moves: [[0, 0]],
    });
  });
  test("move length initializes as 1", () => {
    expect(workingGrid.getState().moves.length).toBe(1);
    // expect(workingGrid.getState()).toEqual(defaultState);
  });
  //internal workings
  test("move is added to moves", () => {
    workingGrid.moveRight();
    workingGrid.moveDown();
    expect(workingGrid.getState().moves.length).toBe(3);
  });

  test("move length doesnt pass rewind limit", () => {
    const x = new GameGridHtml("#root", {
      matrix,
      options: { rewind_limit: 2 },
    });
    x.moveRight();
    x.moveRight();
    expect(x.getState().moves.length).toBe(2);
  });
  // test("handlers attach on instantiation", () => {});
  // test("hitting limit fires events", () => {});
  // test("hitting interactive fires interactive", () => {});
  // test("hitting barrier fires barrier", () => {});
  // test("hitting custom type fires custom type event", () => {});

  // // api tests
  // test("destroy removes event listeners", () => {});
  test("getState return full state", () => {
    expect(workingGrid.getState().moves.length).toBe(1);
    expect(workingGrid.getState()).toEqual(defaultState);
  });
  test("setMatrix applies given matrix and getMatrix gets", () => {
    workingGrid.setMatrix([[{ type: "open" }, { type: "open" }]]);
    expect(workingGrid.getMatrix().length).toBe(1);
    expect(workingGrid.getMatrix()[0].length).toBe(2);
  });
  test("setStateSync updates whole state correctly", () => {
    const newState = {
      active_coords: [0, 0],
      prev_coords: [0, 0],
      current_direction: "",
      rendered: false,
      moves: [[0, 0]],
    };
    workingGrid.setStateSync(newState);
    expect(workingGrid.getState()).toEqual(newState);
  });
  test("setStateSync updates partial state correctly", () => {
    workingGrid.setStateSync({ current_direction: "blueberry" });
    expect(workingGrid.getState().current_direction).toMatch("blueberry");
    expect(workingGrid.getState().rendered).toBe(false);
  });
  test("setFocusToContainer sets focus to container", () => {
    workingGrid.setFocusToContainer();
    expect(document.activeElement).toEqual(workingGrid.getRefs().container);
  });
  test("setFocusToCell sets to given cell", () => {
    workingGrid.render();
    workingGrid.setFocusToCell(1, 1);
    expect(document.activeElement).toEqual(workingGrid.getRefs().cells[1][1]);
  });
  test("setFocusToCell defaults to active_coords", () => {
    workingGrid.render();
    workingGrid.setFocusToCell();
  });

  // // move API
  test("moveLeft moves left", () => {
    const x = new GameGridHtml("#root", {
      matrix,
    });
    x.moveLeft();
    const state = x.getState();
    expect(state.current_direction).toMatch("left");
    expect(state.active_coords).toEqual([0, 0]);
    expect(state.next_coords).toEqual([0, -1]);
  });
  test("moveRight moves right", () => {
    const x = new GameGridHtml("#root", {
      matrix,
    });
    x.moveRight();
    const state = x.getState();
    expect(state.current_direction).toMatch("right");
    expect(state.active_coords).toEqual([0, 0]);
    expect(state.next_coords).toEqual([0, 1]);
  });
  test("moveUp moves up", () => {
    const x = new GameGridHtml("#root", {
      matrix,
    });
    x.moveUp();
    const state = x.getState();
    expect(state.current_direction).toMatch("up");
    expect(state.active_coords).toEqual([0, 0]);
    expect(state.next_coords).toEqual([-1, 0]);
  });
  test("moveDown moves down", () => {
    const x = new GameGridHtml("#root", {
      matrix,
    });
    x.moveDown();
    const state = x.getState();
    expect(state.current_direction).toMatch("down");
    expect(state.active_coords).toEqual([0, 0]);
    expect(state.next_coords).toEqual([1, 0]);
  });
  // test("moveLeft unblocked goes left", () => {});
  // test("moveLeft blocked stays", () => {});
  // test("moveRight unblocked goes left", () => {});
  // test("moveRight blocked stays", () => {});
  // test("moveUp unblocked goes left", () => {});
  // test("moveUp blocked stays", () => {});
  // test("moveDown unblocked goes left", () => {});
  // test("moveDown blocked stays", () => {});

  // // render tests
  test("container classes are applied", () => {
    workingGrid.render();
    expect(
      workingGrid.getRefs().container.classList.contains("lib-GameGridHtml")
    ).toBe(true);
  });
  test("row classes are applied", () => {
    workingGrid.render();
    const rows = workingGrid.getRefs().rows;
    expect(rows[0].classList.contains("lib-GameGridHtml__row")).toBe(true);
    expect(rows[1].classList.contains("lib-GameGridHtml__row")).toBe(true);
    expect(rows[2].classList.contains("lib-GameGridHtml__row")).toBe(true);
  });
  test("cell classes are applied", () => {
    workingGrid.render();
    const cells = workingGrid.getRefs().cells;
    expect(cells[0][0].classList.contains("lib-GameGridHtml__cell")).toBe(true);
    expect(cells[1][1].classList.contains("lib-GameGridHtml__cell")).toBe(true);
    expect(cells[2][2].classList.contains("lib-GameGridHtml__cell")).toBe(true);
  });
  test("cell width is correct", () => {
    workingGrid.render();
    const cells = workingGrid.getRefs().cells;
    expect(cells[0][0].style.width.substring(0, 4)).toMatch("33.3");
  });
  test("cell content renders", () => {
    workingGrid.render();
    const cells = workingGrid.getRefs().cells;
    expect(cells[0][1].querySelector("input").nodeName).toMatch("INPUT");
  });
  test("default row attributes rendered", () => {
    workingGrid.render();
    const rows = workingGrid.getRefs().rows;
    expect(rows[0].getAttribute("data-row-index")).toMatch("0");
  });
  test("default cell attributes are rendered", () => {
    workingGrid.render();
    const cells = workingGrid.getRefs().cells;
    expect(cells[0][0].getAttribute("data-row-index")).toMatch("0");
    expect(cells[1][0].getAttribute("data-row-index")).toMatch("1");
    expect(cells[1][1].getAttribute("data-col-index")).toMatch("1");
    expect(cells[1][0].getAttribute("data-coords")).toMatch("1,0");
  });

  test("cell custom attributes render", () => {
    workingGrid.render();
    const cells = workingGrid.getRefs().cells;
    expect(cells[0][1].getAttribute("data-butt")).toMatch("doody");
    expect(cells[0][1].getAttribute("data-doody")).toMatch("butt");
  });
});
