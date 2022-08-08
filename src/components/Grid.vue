<template>
  <div class="grid">
    <div class="row" v-for="(row, y) of gridStore.grid" :key="y">
      <div
        class="cell"
        v-for="(cell, x) of row"
        :key="x"
        :class="{ [cell[0]]: true, [cell[1]]: true }"
        @pointerdown="handlePointerDown($event, x, y)"
        @pointerup="handlePointerUp"
        @pointerenter="handlePointerEnter($event, x, y)"
        @contextmenu="handleRightClick($event, x, y)"
      ></div>
    </div>
    <div class="coordinates" v-if="mouseGridCoordinates">
      [{{ mouseGridCoordinates.x }};{{ mouseGridCoordinates.y }}]
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useGridStore } from "@/stores/grid";
  import { type CellState, CellType, type Cell } from "@/types/Cell.js";
  import { cloneDeep } from "lodash";
  import { storeToRefs } from "pinia";

  const gridStore = useGridStore();
  const cellSize = 30;
  const rowSize = Math.floor(window.innerWidth / cellSize);
  const colSize = Math.floor(window.innerHeight / cellSize);
  gridStore.createGrid(rowSize, colSize);

  const { grid: gridRef } = storeToRefs(gridStore);
  const gridHistory = useManualRefHistory(gridRef, {
    capacity: 5,
    clone: true,
  });

  const isPointerDown = ref(false);
  const oldTile = ref<undefined | CellType>(undefined);
  const mouseGridCoordinates = ref<{ x: number; y: number } | undefined>(
    undefined
  );

  const cycleCellType = (type: CellType): CellType => {
    if (type === CellType.START && !gridStore.hasEnd) return CellType.END;
    if (type === CellType.START) return CellType.WALL;
    if (type === CellType.END) return CellType.WALL;
    if (type === CellType.GROUND && !gridStore.hasStart) return CellType.START;
    if (type === CellType.GROUND && !gridStore.hasEnd) return CellType.END;
    if (type === CellType.GROUND) return CellType.WALL;
    if (type === CellType.WALL) return CellType.WATER;
    return CellType.GROUND;
  };

  const handleRightClick = (ev: MouseEvent, x: number, y: number) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  const handlePointerDown = (ev: PointerEvent, x: number, y: number) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.button === 2) {
      // Right click
      isPointerDown.value = true;
      oldTile.value = gridStore.placing;
      gridStore.placing = CellType.GROUND;
      changeCellType(x, y, CellType.GROUND);
      return;
    }
    if (ev.button !== 0) return;
    changeCellType(x, y);
    if (
      gridStore.placing === CellType.START ||
      gridStore.placing === CellType.END
    ) {
      gridStore.placing = cycleCellType(gridStore.placing);
    }
    if (
      gridStore.cell(x, y)?.[0] !== CellType.WALL &&
      gridStore.cell(x, y)?.[0] !== CellType.WATER &&
      gridStore.cell(x, y)?.[0] !== CellType.GROUND
    )
      return;
    isPointerDown.value = true;
    gridStore.placing = gridStore.cell(x, y)?.[0] ?? gridStore.placing;
  };

  const handlePointerUp = (ev: PointerEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    isPointerDown.value = false;
    if (oldTile.value !== undefined) {
      gridStore.placing = oldTile.value;
      oldTile.value = undefined;
    }
    gridHistory.commit();
  };

  const handlePointerEnter = (ev: PointerEvent, x: number, y: number) => {
    ev.preventDefault();
    ev.stopPropagation();
    mouseGridCoordinates.value = { x, y };
    if (!isPointerDown.value) return;
    if (
      gridStore.cell(x, y)?.[0] === CellType.START ||
      gridStore.cell(x, y)?.[0] === CellType.END
    )
      return;
    changeCellType(x, y);
  };

  const changeCellType = (x: number, y: number, type?: CellType) => {
    if (!gridStore.canPlace) return;
    const cell = gridStore.cell(x, y);
    if (!cell) return;
    const t = type ?? gridStore.placing;
    if (t === CellType.START) {
      const start = gridStore.start;
      if (start) start[0] = CellType.GROUND;
    }
    if (t === CellType.END) {
      const end = gridStore.end;
      if (end) end[0] = CellType.GROUND;
    }
    cell[0] = t;
  };

  const { shift, meta, ctrl, y, z } = useMagicKeys({
    onEventFired(e) {
      if (
        (e.key === "z" || e.key === "y" || e.key === "meta") &&
        e.type === "keydown"
      ) {
        e.preventDefault();
      }
    },
  });

  whenever(z, () => {
    if (!meta.value && !ctrl.value) return;
    if (shift.value && gridHistory.canRedo.value && gridStore.canPlace)
      gridHistory.redo();
    if (!shift.value && gridHistory.canUndo.value && gridStore.canPlace)
      gridHistory.undo();
  });
  whenever(y, () => {
    if (!meta.value && !ctrl.value) return;
    if (gridHistory.canRedo.value && gridStore.canPlace) gridHistory.redo();
  });
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

    .coordinates {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid black;
      border-radius: 5px;
      pointer-events: none;
      user-select: none;
    }

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
      transition: transform 0.1s ease-in-out;

      &:first-child {
        border-left: none;
      }

      &:hover {
        transform: scale(1.1);
        background-color: rgba(156, 136, 255, 0.3);
      }
      &.exploring-state {
        background-color: #fad3906f;
      }

      &.explored-state {
        background-color: #7f8fa655;
      }

      &.selected-state {
        background-color: rgb(145, 255, 196);
      }

      &.exploring-next-state {
        background-color: #fbc531;
      }

      &.wall {
        background-color: #353b48;
      }

      &.start {
        background-color: #44bd32;

        &.exploring-state {
          background-color: #4cd137;
        }
      }

      &.end {
        background-color: #c23616;
      }

      &.water {
        background-color: #487eb0;
        &.selected-state,
        &.exploring-next-state {
          background-color: #00a8ff;
        }
      }
    }
  }
</style>
