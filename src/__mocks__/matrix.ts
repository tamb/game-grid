export const matrix = [
  [
    { type: 'open', cellAttributes: [['data-test', 'yankee']] },
    {
      type: 'open',
      cellAttributes: [
        ['data-butt', 'doody'],
        ['data-doody', 'butt'],
      ],
      renderFunction() {
        return document.createElement('input');
      },
    },
    { type: 'open' },
  ],
  [{ type: 'open' }, { type: 'open' }, { type: 'open' }],
  [{ type: 'open' }, { type: 'open' }, { type: 'open' }],
];
