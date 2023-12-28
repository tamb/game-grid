/// <reference types="jest" />
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

describe('renderAttributes util', () => {
  let testDiv: HTMLElement | null;
  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', `<div id="test"></div>`);
    testDiv = document.getElementById('test');
  });

  test('non-class attributes render', () => {
    renderAttributes(testDiv, [
      ['data-butt', 'booty'],
      ['data-fake', 'fake'],
    ]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.getAttribute('data-butt')).toMatch('booty');
    expect(testDiv.getAttribute('data-fake')).toMatch('fake');
  });

  test('multiple classes render', () => {
    renderAttributes(testDiv, [['class', 'howdy partner']]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.classList.contains('howdy')).toBe(true);
    expect(testDiv.classList.contains('partner')).toBe(true);
    expect(testDiv.classList.contains('roro')).toBe(false);
  });

  test('single class renders', () => {
    renderAttributes(testDiv, [['class', 'single']]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.classList.contains('single')).toBe(true);
  });
});

describe('fireCustomEvent util', () => {
  let mockCallback;
  let testEventName;
  let testData;
  let testInstance;

  beforeEach(() => {
    // Mock window.dispatchEvent to test if it gets called correctly
    window.dispatchEvent = jest.fn();

    // Mock callback function
    mockCallback = jest.fn();

    // Test data
    testEventName = 'testEvent';
    testData = { key: 'value' };

    // Test instance
    testInstance = {
      options: {
        callbacks: {
          testEvent: mockCallback,
        },
      },
    };
  });

  test('dispatches custom event', () => {
    test('fires a custom event with the correct name and data', () => {
      const mockCallback = jest.fn();
      window.addEventListener('testEvent', mockCallback);

      fireCustomEvent('testEvent', { key: 'value' });

      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0].detail).toEqual({ key: 'value' });

      window.removeEventListener('testEvent', mockCallback);
    });
    fireCustomEvent.call(testInstance, testEventName, testData);

    expect(window.dispatchEvent).toHaveBeenCalled();
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: testEventName,
        detail: expect.objectContaining({
          ...testData,
          game_grid_instance: testInstance,
        }),
      }),
    );
  });

  test('calls appropriate callback', () => {
    fireCustomEvent.call(testInstance, testEventName, testData);

    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(testInstance);
  });

  test('does not call callback if not defined', () => {
    delete testInstance.options.callbacks.testEvent;

    fireCustomEvent.call(testInstance, testEventName, testData);

    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('renderAttributes util', () => {
  let testDiv: HTMLElement | null;

  beforeEach(() => {
    document.body.insertAdjacentHTML('afterbegin', `<div id="test"></div>`);
    testDiv = document.getElementById('test');
  });

  afterEach(() => {
    if (testDiv) {
      document.body.removeChild(testDiv);
    }
  });

  test('adds multiple classes', () => {
    renderAttributes(testDiv, [['class', 'class1 class2']]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.classList.contains('class1')).toBe(true);
    expect(testDiv.classList.contains('class2')).toBe(true);
  });

  test('adds single class', () => {
    renderAttributes(testDiv, [['class', 'single']]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.classList.contains('single')).toBe(true);
  });

  test('sets non-class attributes', () => {
    renderAttributes(testDiv, [['data-test', 'value']]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.getAttribute('data-test')).toBe('value');
  });

  test('handles mixed class and non-class attributes', () => {
    renderAttributes(testDiv, [
      ['class', 'class1'],
      ['data-test', 'value'],
    ]);
    if (testDiv === null) throw new Error('testDiv is null');
    expect(testDiv.classList.contains('class1')).toBe(true);
    expect(testDiv.getAttribute('data-test')).toBe('value');
  });
});

describe('insertStyles util', () => {
  it('should insert styles into the document head', () => {
    const initialHeadInnerHTML = document.head.innerHTML;
    insertStyles();
    const finalHeadInnerHTML = document.head.innerHTML;

    expect(finalHeadInnerHTML).not.toEqual(initialHeadInnerHTML);
    expect(finalHeadInnerHTML).toContain('.gamegrid *');
    expect(finalHeadInnerHTML).toContain('.gamegrid__stage');
    expect(finalHeadInnerHTML).toContain('.gamegrid__row');
    expect(finalHeadInnerHTML).toContain('.gamegrid__cell');
    expect(finalHeadInnerHTML).toContain('.gamegrid__cell--active');
    expect(finalHeadInnerHTML).toContain('.gamegrid__cell::before');
  });
});
