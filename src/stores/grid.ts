import { CellState, CellType, type Cell } from "@/types/Cell";
import type { Grid } from "@/types/Grid";
import { defineStore } from "pinia";

export const useGridStore = defineStore({
  id: "grid",
  state: () => ({
    grid: undefined as undefined | Grid,
    canPlace: true,
  }),
  getters: {
    rowSize(state) {
      return state.grid?.length ?? 0;
    },
    columnSize(state) {
      return state.grid?.[0]?.length ?? 0;
    },
    cell(state) {
      return (x: number, y: number) => {
        return state.grid?.[y]?.[x];
      };
    },
    hasStart(state) {
      return state.grid?.some((row) =>
        row.some((col) => col[0] === CellType.START)
      );
    },
    hasEnd(state) {
      return state.grid?.some((row) =>
        row.some((col) => col[0] === CellType.END)
      );
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
          row.push([CellType.DEFAULT, CellState.DEFAULT]);
        }
        grid.push(row);
      }
      this.grid = grid;
    },
    resetGrid() {
      this.createGrid(this.rowSize, this.columnSize);
    },
  },
});
