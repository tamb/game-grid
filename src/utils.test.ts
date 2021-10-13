/// <reference types="jest" />
/**
 * @jest-environment jsdom
 */

const renderAttributes = require("./utils").renderAttributes;

document.body.insertAdjacentHTML("afterbegin", `<div id="test"></div>`);
const testDiv = document.getElementById("test");

describe("renderAttributes util", () => {
  test("non-class attributes render", () => {
    renderAttributes(testDiv, [
      ["data-butt", "booty"],
      ["data-fake", "fake"],
    ]);
    expect(testDiv.getAttribute("data-butt")).toMatch("booty");
    expect(testDiv.getAttribute("data-fake")).toMatch("fake");
  });

  test("multiple classes render", () => {
    renderAttributes(testDiv, [["class", "howdy partner"]]);
    expect(testDiv.classList.contains("howdy")).toBe(true);
    expect(testDiv.classList.contains("partner")).toBe(true);
    expect(testDiv.classList.contains("roro")).toBe(false);
  });

  test("single class renders", () => {
    renderAttributes(testDiv, [["class", "single"]]);
    expect(testDiv.classList.contains("single")).toBe(true);
  });
});
