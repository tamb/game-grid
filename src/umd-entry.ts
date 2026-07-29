/**
 * UMD bundle entry: attaches named exports to the default {@link GameGrid} class
 * so script-tag consumers can use `new GameGrid()` and `GameGrid.gridEventsEnum`
 * without a `.default` accessor.
 */
import GameGrid, {
  cellTypeEnum,
  classesEnum,
  directionClassEnum,
  directionEnum,
  gameGridEventsEnum,
  gridEventsEnum,
  INITIAL_STATE,
  keycodeEnum,
} from './index';

export default Object.assign(GameGrid, {
  GameGrid,
  cellTypeEnum,
  classesEnum,
  directionClassEnum,
  directionEnum,
  gameGridEventsEnum,
  gridEventsEnum,
  INITIAL_STATE,
  keycodeEnum,
});
