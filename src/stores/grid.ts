import { CellState, CellType, type Cell } from "@/types/Cell";
import type { Grid } from "@/types/Grid";
import { defineStore } from "pinia";

export const useGridStore = defineStore({
  id: "grid",
  state: () => ({
    grid: undefined as undefined | Grid,
    canPlace: true,
    placing: CellType.START,
    cost: undefined as undefined | number,
  }),
  getters: {
    rowSize(state) {
      return state.grid?.[0]?.length ?? 0;
    },
    columnSize(state) {
      return state.grid?.length ?? 0;
    },
    cell(state) {
      return (x: number, y: number) => {
        return state.grid?.[y]?.[x];
      };
    },
    start(state): Cell | undefined {
      return state.grid?.flat(1)?.find((c) => c[0] === CellType.START);
    },
    end(state): Cell | undefined {
      return state.grid?.flat(1)?.find((c) => c[0] === CellType.END);
    },
    hasStart(): boolean {
      return this.start !== undefined;
    },
    hasEnd(): boolean {
      return this.end !== undefined;
    },
  },
  actions: {
    createGrid(rowSize: number, columnSize: number) {
      if (rowSize <= 0 || columnSize <= 0) {
        this.grid = undefined;
        return;
      }
      const grid = [];
      for (let x = 0; x < columnSize; x++) {
        const row: Cell[] = [];
        for (let y = 0; y < rowSize; y++) {
          row.push([CellType.GROUND, CellState.DEFAULT]);
        }
        grid.push(row);
      }
      this.grid = grid;
    },
    resetGrid() {
      this.createGrid(this.rowSize, this.columnSize);
      this.placing = CellType.START;
    },
  },
});
