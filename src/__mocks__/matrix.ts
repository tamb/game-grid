import { ICell } from '../interfaces';

export const matrix: ICell[][] = [
  [
    {
      type: 'open',
      cellAttributes: [['data-test', 'yankee']],
      foo: 'bar',
      foo2: 'bar2',
    },
    {
      type: 'open',
      buzz: 'fizz',

      cellAttributes: [
        ['data-butt', 'doody'],
        ['data-doody', 'butt'],
      ],
      render() {
        return document.createElement('input');
      },
    },
    { type: 'barrier' },
  ],
  [{ type: 'open' }, { type: 'interactive' }, { type: 'open' }],
  [{ type: 'open' }, { type: 'open' }, { type: 'open' }],
];
