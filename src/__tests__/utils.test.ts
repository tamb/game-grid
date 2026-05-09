import { fireGameGridEvent, getCoordsFromElement, insertStyles, renderAttributes } from '../utils';

describe('getCoordsFromElement util', () => {
  test('parses data-gamegrid-coords as [x, y]', () => {
    const el = document.createElement('div');
    el.setAttribute('data-gamegrid-coords', '2,1');
    expect(getCoordsFromElement(el)).toEqual([2, 1]);
  });

  test('returns undefined for missing or invalid coords', () => {
    expect(getCoordsFromElement(document.createElement('div'))).toBeUndefined();
    const el = document.createElement('div');
    el.setAttribute('data-gamegrid-coords', 'a,b');
    expect(getCoordsFromElement(el)).toBeUndefined();
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

describe('fireGameGridEvent util', () => {
  let mockCallback: ReturnType<typeof vi.fn>;
  let testEventName: string;
  let testData: { key: string };

  beforeEach(() => {
    vi.spyOn(window, 'dispatchEvent').mockReturnValue(true);
    mockCallback = vi.fn();
    testEventName = 'testEvent';
    testData = { key: 'value' };
    window.addEventListener(testEventName, mockCallback);
  });

  test('dispatches custom event on target with gameGridInstance', () => {
    const target = new EventTarget();
    vi.spyOn(target, 'dispatchEvent').mockReturnValue(true);
    const instance = { id: 'grid-a' };
    fireGameGridEvent(target, instance, testEventName, testData);

    expect(target.dispatchEvent).toHaveBeenCalled();
    const ev = (target.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent;
    expect(ev.type).toBe(testEventName);
    expect(ev.detail.key).toBe('value');
    expect(ev.detail.gameGridInstance).toBe(instance);
  });

  afterEach(() => {
    window.removeEventListener(testEventName, mockCallback);
    vi.restoreAllMocks();
  });
});

describe('insertStyles util', () => {
  test('inserts style tag into head', () => {
    insertStyles();
    expect(document.querySelector('[data-testid="gamegrid-styles"]')).toBeTruthy();
  });

  test('is idempotent (single stylesheet marker)', () => {
    insertStyles();
    const n = document.querySelectorAll('style[data-gamegrid-styles]').length;
    insertStyles();
    expect(document.querySelectorAll('style[data-gamegrid-styles]').length).toBe(n);
    expect(n).toBeGreaterThanOrEqual(1);
  });
});
