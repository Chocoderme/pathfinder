<template>
  <div class="grid">
    <div class="row" v-for="(row, y) of gridStore.grid" :key="y">
      <div
        class="cell"
        v-for="(cell, x) of row"
        :key="x"
        :class="{ [cell[0]]: true, [cell[1]]: true }"
        @pointerdown="handlePointerDown($event, x, y)"
        @pointerup="isPointerDown = false"
        @pointerenter="handlePointerEnter($event, x, y)"
        @contextmenu="handleRightClick($event, x, y)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useGridStore } from "@/stores/grid";
  import { type CellState, CellType, type Cell } from "@/types/Cell.js";

  const gridStore = useGridStore();

  const cellSize = 30;

  const rowSize = Math.floor(window.innerWidth / cellSize);
  const colSize = Math.floor(window.innerHeight / cellSize);

  gridStore.createGrid(rowSize, colSize);

  const isPointerDown = ref(false);
  const placingCellType = ref<CellType | undefined>(undefined);

  const cycleCellType = (type: CellType): CellType => {
    if (type === CellType.START && !gridStore.hasEnd) return CellType.END;
    if (type === CellType.END) return CellType.WALL;
    if (type === CellType.DEFAULT && !gridStore.hasStart) return CellType.START;
    if (type === CellType.DEFAULT && !gridStore.hasEnd) return CellType.END;
    if (type === CellType.DEFAULT) return CellType.WALL;
    if (type === CellType.WALL) return CellType.HOLE;
    return CellType.DEFAULT;
  };

  const handleRightClick = (ev: MouseEvent, x: number, y: number) => {
    ev.preventDefault();
    ev.stopPropagation();
    placingCellType.value = CellType.DEFAULT;
    changeCellType(x, y, CellType.DEFAULT);
  };

  const handlePointerDown = (ev: PointerEvent, x: number, y: number) => {
    ev.preventDefault();
    ev.stopPropagation();
    changeCellType(x, y);
    if (
      gridStore.cell(x, y)?.[0] !== CellType.WALL &&
      gridStore.cell(x, y)?.[0] !== CellType.HOLE &&
      gridStore.cell(x, y)?.[0] !== CellType.DEFAULT
    )
      return;
    isPointerDown.value = true;
    placingCellType.value = gridStore.cell(x, y)?.[0];
  };

  const handlePointerEnter = (ev: PointerEvent, x: number, y: number) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (!isPointerDown.value || placingCellType.value === undefined) return;
    if (
      gridStore.cell(x, y)?.[0] === CellType.START ||
      gridStore.cell(x, y)?.[0] === CellType.END
    )
      return;
    changeCellType(x, y, placingCellType.value);
  };

  const changeCellType = (x: number, y: number, type?: CellType) => {
    if (!gridStore.canPlace) return;
    const cell = gridStore.cell(x, y);
    if (!cell) return;
    cell[0] = type ?? cycleCellType(cell[0]);
  };
</script>

<style lang="scss" scoped>
  .grid {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: stretch;
    align-items: stretch;
    width: 100%;
    height: 100%;

    .row {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: stretch;
      align-items: stretch;
      width: 100%;
      height: 100%;

      &:first-child > * {
        border-top: none;
      }
    }
    .cell {
      box-sizing: border-box;
      border-left: 1px solid black;
      border-top: 1px solid black;
      background-color: transparent;
      display: block;
      aspect-ratio: 1;
      flex: 1 1;
      cursor: pointer;

      &:first-child {
        border-left: none;
      }

      &:hover {
        transform: scale(1.1);
      }
      &.exploring-state {
        background-color: lightblue;
      }

      &.explored-state {
        background-color: rgb(57, 100, 115);
      }

      &.selected-state {
        background-color: rgb(145, 255, 196);
      }

      &.wall {
        background-color: gray;
      }

      &.start {
        background-color: green;

        &.exploring-state {
          background-color: lightgreen;
        }
      }

      &.end {
        background-color: darkred;
      }

      &.hole {
        background-color: black;
      }
    }
  }
</style>
