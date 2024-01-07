import GameGrid from './../dist/main';
import { generateMaze } from './maze';

class GameCoin extends HTMLElement {
  constructor() {
    super();

    // Create a shadow DOM for the component
    this.attachShadow({ mode: 'open' });

    // Add the styles to the shadow DOM
    this.shadowRoot!.innerHTML = `
        <style>
            :host{
                background-color: transparent !important;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .game-coin{
                max-width: 100%;
                max-height: 100%;
            }
        </style>
        <img class="game-coin" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAdnJLH8AAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAABBpJREFUeNrt3bFKHEEYwPGZ5ZhtxE6wSGEZLGKl+DhWeS4fRwikFJvAFXaWWtwucpMXSBHuE2aH+f36zeyus/+cB9+aa62ppZrbrt/alKahb8AxHfPI159r28ufhn76YHACAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAJ3Y9XzyrUcpv0KZy9AbMC95+JFwAWi5AXO73VdKScuyDH3/53mua1qbrT/6+wj8CgACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAGzd8OPApYw9j48AdG2e55Pn+c/OzprP469/7obegO/PN6l+vp18/P7pMrT+9DCF3gfR+/sEhv8EsAWRBwAifAcAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAnTAN2LG8u9jEeZhmFIBm1vX0vy3/8fERXz84z1+//Tr92LRPgdchfIllCY7D7688hQLQN/8D0ivfAYAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAEAnup8GLKV0e+55d5Fq2tuFjBuAKZ3+99nLXNKyLKH1e5/nj87j59fb0PHn1yX0TobDYR9a/yq4/14e72P792EK/QBrqsEXKnQegC0YeZ4/eu2Rh5/2fAcAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgACAALgFIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIAtLBzC/qWX29T/XxzIziJTwAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAP9t1/oEjumYTz02LznN81wj678/3zS9/mXJoePPr0ta17XZ+R8OwX9gfxU7/OkydPyPn7+b7V8BCKq5pjXFNn/9fOv5FjR9+OmfXwFAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAICt63oceBOC8+xRh5fW1x88PDjPT4xPACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAm5VrrU1PoOa2609panoCL4/3Q2/A7w9PTdc/pmNu+wA2Xd4nABiZAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAFs3/PsAWmv9PoLWWs/jt38AvQ8AEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAIB/+guBPqAWIjGgAAAAABJ0RVh0RVhJRjpPcmllbnRhdGlvbgAxhFjs7wAAAABJRU5ErkJggg==" alt="coin" />
      `;
  }
}

// Define the custom element tag
customElements.define('game-coin', GameCoin);

function createCoinGrid() {
  const coinMaze = generateMaze(10, 10);
  const coinGrid: GameGrid = new GameGrid(
    {
      matrix: coinMaze,
      options: {
        id: 'coinGrid',
      },
    },
    document.querySelector('#maze3'),
  );

  coinGrid.matrix.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell.type === 'interactive') {
        coinGrid.refs.cells[rowIndex][cellIndex].innerHTML =
          `<game-coin></game-coin>`;
      }
    });
  });

  window.addEventListener(
    'gamegrid:move:collide',
    function (e: CustomEventInit) {
      if (e.detail.gameGridInstance.options.id === 'coinGrid') {
        const state = e.detail.gameGridInstance.state;
        const activeCell = state.activeCoords;
        const cell = coinGrid.refs.cells[activeCell[0]][activeCell[1]];
        cell.querySelector('game-coin')?.remove();
      }
    },
  );
}

export function setupCoinGrid() {
  createCoinGrid();
  document
    .querySelector('#regenerate-maze')
    ?.addEventListener('click', function () {
      document.getElementById('maze3')!.innerHTML = '';
      createCoinGrid();
    });
}
