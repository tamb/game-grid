/**
 * @jest-environment jsdom
 */
import {
  getKeyByValue,
  renderAttributes,
  getCoordsFromElement,
  fireCustomEvent,
  mapRowColIndicesToXY,
  mapXYToRowColIndices,
  insertStyles,
} from './utils';

describe('getKeyByValue util', () => {
  test('returns the correct key for a given value', () => {
    const testObject = { key1: 'value1', key2: 'value2' };
    expect(getKeyByValue(testObject, 'value1')).toBe('key1');
    expect(getKeyByValue(testObject, 'value2')).toBe('key2');
  });

  test('returns undefined if the value is not found', () => {
    const testObject = { key1: 'value1', key2: 'value2' };
    expect(getKeyByValue(testObject, 'value3')).toBeUndefined();
  });
});

describe('renderAttributes util', () => {
  let testDiv: HTMLElement;
  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', `<div id="test"></div>`);
    testDiv = document.getElementById('test')!;
  });

  test('non-class attributes render', () => {
    renderAttributes(testDiv, [
      ['data-butt', 'booty'],
      ['data-fake', 'fake'],
    ]);
    expect(testDiv.getAttribute('data-butt')).toMatch('booty');
    expect(testDiv.getAttribute('data-fake')).toMatch('fake');
  });

  test('multiple classes render', () => {
    renderAttributes(testDiv, [['class', 'howdy partner']]);
    expect(testDiv.classList.contains('howdy')).toBe(true);
    expect(testDiv.classList.contains('partner')).toBe(true);
    expect(testDiv.classList.contains('roro')).toBe(false);
  });

  test('single class renders', () => {
    renderAttributes(testDiv, [['class', 'single']]);
    expect(testDiv.classList.contains('single')).toBe(true);
  });
});

describe('getCoordsFromElement util', () => {
  test('returns the correct coordinates for a given element', () => {
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.left = '50px';
    testElement.style.top = '100px';
    document.body.appendChild(testElement);

    expect(getCoordsFromElement(testElement)).toEqual([50, 100]);

    document.body.removeChild(testElement);
  });
});

describe('mapRowColIndicesToXY util', () => {
  test('returns the correct x and y coordinates for given row and column indices', () => {
    expect(mapRowColIndicesToXY(1, 2)).toEqual([2, 1]);
  });
});

describe('mapXYToRowColIndices util', () => {
  test('returns the correct row and column indices for given x and y coordinates', () => {
    expect(mapXYToRowColIndices(2, 1)).toEqual([1, 2]);
  });
});

describe('fireCustomEvent util', () => {
  let mockCallback: jest.Mock;
  let testEventName: string;
  let testData: { key: string };

  beforeEach(() => {
    // Mock window.dispatchEvent to test if it gets called correctly
    window.dispatchEvent = jest.fn();

    // Mock callback function
    mockCallback = jest.fn();

    // Test data
    testEventName = 'testEvent';
    testData = { key: 'value' };

    window.addEventListener(testEventName, mockCallback);
  });

  test('dispatches custom event', () => {
    fireCustomEvent(testEventName, testData);

    expect(window.dispatchEvent).toHaveBeenCalled();
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: testEventName,
        detail: expect.objectContaining({
          ...testData,
        }),
      }),
    );
  });

  afterEach(() => {
    window.removeEventListener(testEventName, mockCallback);
  });
});
