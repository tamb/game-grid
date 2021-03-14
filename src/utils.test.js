import {
  getCoordsFromElement,
  renderDataAttributes,
  fireCustomEvent,
} from "./utils";
describe("Utility Tests", () => {
  let div = null;

  beforeEach(() => {
    div = document.createElement("div");
  });

  test("getCoordsFromElement returns correct array", () => {
    div.setAttribute("data-coords", "0,11");
    expect(getCoordsFromElement(div)).toEqual([0, 11]);
  });

  test("getCoordsFromElement ignores whitespace", () => {
    div.setAttribute("data-coords", " 0,   11 ");
    expect(getCoordsFromElement(div)).toEqual([0, 11]);
  });

  test("renderDataAttributes applies correct attribute values", () => {
    const attrs = [
      ["fname", "marco"],
      ["lname", "polo"],
    ];

    renderDataAttributes(div, attrs);

    expect(div.dataset.fname).toMatch("marco");
    expect(div.dataset.lname).toMatch("polo");
  });

  test("fireCustomEvent bubbles", () => {
    document.addEventListener("custom", (e) => {
      expect(e.bubbles).toBe(true);
    });
    fireCustomEvent(div, "custom");
  });

  test("fireCustomEvent event has data", () => {
    document.addEventListener("custom", (e) => {
      expect(e.detail.fname).toBe(true);
    });
    fireCustomEvent(div, "custom", { fname: "marco" });
  });
});
