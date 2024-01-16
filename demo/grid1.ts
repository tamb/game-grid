import GameGrid from 'gamegrid';
import { tileTypeEnum } from './enums';
const matrix = [
  [
    {
      type: tileTypeEnum.OPEN,
      cellAttributes: [
        ['data-butt', 'sauce'],
        ['class', 'butt booty butty'],
      ],
      render() {
        let clickCount = 0;

        const frag = document.createDocumentFragment();
        const count = document.createElement('span');
        const button = document.createElement('button');
        button.textContent = '+1';
        button.addEventListener('click', function () {
          clickCount++;
          count.textContent = clickCount.toString();
        });
        frag.appendChild(button);
        frag.appendChild(count);
        return frag;
      },
    },
    {
      type: tileTypeEnum.INTERACTIVE,
      cellAttributes: [['data-cell-type', 'interactive']],
    },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [['data-cell-type', 'barrier']],
    },
  ],
  [
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [['data-cell-type', 'barrier']],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
];

export function createGrid() {
  console.log('building grid');

  const grid = new GameGrid(
    {
      matrix,
      options: {
        infiniteY: true,
        infiniteX: true,
        clickable: true,
        arrowControls: true,
        wasdControls: true,
        id: 'grid1',
      },
    },
    document.getElementById('grid1'),
  );
  console.log('Grid with Clicker: ', grid);
}
