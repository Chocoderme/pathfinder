export enum CellState {
  DEFAULT = "default-state",
  EXPLORING = "exploring-state",
  EXPLORED = "explored-state",
  SELECTED = "selected-state",
}
export enum CellType {
  DEFAULT = "default",
  START = "start",
  END = "end",
  WALL = "wall",
  HOLE = "hole",
}
export type Cell = [CellType, CellState];
