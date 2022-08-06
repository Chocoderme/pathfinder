export enum CellState {
  DEFAULT = "default-state",
  EXPLORING = "exploring-state",
  EXPLORING_NEXT = "exploring-next-state",
  EXPLORED = "explored-state",
  SELECTED = "selected-state",
}
export enum CellType {
  GROUND = "ground",
  START = "start",
  END = "end",
  WALL = "wall",
  WATER = "water",
}
export type Cell = [CellType, CellState];
