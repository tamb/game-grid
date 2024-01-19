import { ICell } from '../interfaces';

export const matrix: ICell[][] = [
  [
    { type: 'open', cellAttributes: [['data-test', 'yankee']] },
    {
      type: 'open',
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

