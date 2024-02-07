import GameGrid from 'gamegrid';
// Function to generate a random type ('open', 'interactive', or 'barrier')
function getRandomType() {
  const types = ['open', 'interactive', 'barrier'];
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
}

// Function to generate a 2D maze
export function generateMaze(rows: number, columns: number) {
  const maze: { type: string }[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: { type: string }[] = [];
    for (let j = 0; j < columns; j++) {
      const cell = { type: getRandomType() };
      row.push(cell);
    }
    maze.push(row);
  }

  return maze;
}

export function renderMaze(selector, mazeSize) {
  return new GameGrid(
    {
      matrix: generateMaze(mazeSize, mazeSize),
    },
    document.querySelector(selector),
  );
}
