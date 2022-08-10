<template>
  <div class="grid">
    <div
      class="row"
      v-for="(row, y) of gridStore.grid"
      :key="y"
      :style="{ height: `${cellSize}px` }"
    >
      <div
        class="cell"
        v-for="(cell, x) of row"
        :key="x"
        :class="{ [cell[0]]: true, [cell[1]]: true }"
        :style="{ height: `${cellSize}px`, width: `${cellSize}px` }"
        @pointerdown="handlePointerDown($event, x, y)"
        @pointerup="handlePointerUp"
        @contextmenu="handleRightClick($event, x, y)"
      ></div>
    </div>
    <!-- <div class="coordinates" v-if="mouseGridCoordinates">
      [{{ mouseGridCoordinates.x }};{{ mouseGridCoordinates.y }}]
    </div> -->
  </div>
</template>

<script lang="ts" setup>
  import { useGridStore } from "@/stores/grid";
  import { type CellState, CellType, type Cell } from "@/types/Cell.js";
  import type { Grid } from "@/types/Grid";
  import { cloneDeep } from "lodash";
  import { storeToRefs } from "pinia";

  const gridStore = useGridStore();
  const cellSize = 25;
  const rowSize = Math.ceil(window.innerWidth / cellSize);
  const colSize = Math.ceil(window.innerHeight / cellSize);
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

  const saveGrid = useDebounceFn(
    () => {
      if (!window.localStorage) return;
      window.localStorage.setItem("grid", JSON.stringify(gridRef.value));
    },
    1000,
    { maxWait: 10000 }
  );

  const loadGrid = () => {
    if (!window.localStorage) return;
    const savedGrid = window.localStorage.getItem("grid");
    if (!savedGrid) return;
    const parsedGrid = JSON.parse(savedGrid) as Grid;
    for (let i = 0; i < parsedGrid.length; i++) {
      if ((gridStore.grid?.length ?? 0) - 1 <= i) break;
      for (let j = 0; j < parsedGrid[i].length; j++) {
        if ((gridStore.grid?.[i].length ?? 0) - 1 <= j) continue;
        gridStore.grid![i][j][0] = parsedGrid[i][j][0];
      }
    }
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

  const handlePointerUp = (ev?: PointerEvent) => {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    isPointerDown.value = false;
    if (oldTile.value !== undefined) {
      gridStore.placing = oldTile.value;
      oldTile.value = undefined;
    }
    gridHistory.commit();
    saveGrid();
    lastPointerEnterPos.x = -1;
    lastPointerEnterPos.y = -1;
  };

  const lastPointerEnterPos = reactive({ x: -1, y: -1 });
  const handlePointerEnter = (x: number, y: number) => {
    mouseGridCoordinates.value = { x, y };
    if (!isPointerDown.value) return;
    if (
      gridStore.cell(x, y)?.[0] === CellType.START ||
      gridStore.cell(x, y)?.[0] === CellType.END
    )
      return;
    changeCellType(x, y);
    // Draw a line between two points
    if (
      lastPointerEnterPos.x !== -1 &&
      lastPointerEnterPos.y !== -1 &&
      (lastPointerEnterPos.x !== x || lastPointerEnterPos.y !== y) &&
      // Don't do anything if points are too close
      Math.abs(lastPointerEnterPos.y - y) +
        Math.abs(lastPointerEnterPos.x - x) >
        1
    ) {
      if (lastPointerEnterPos.x - x === 0) {
        // Vertical line
        const start = Math.min(lastPointerEnterPos.y, y);
        const end = Math.max(lastPointerEnterPos.y, y);
        for (let j = start; j < end; j++) {
          if (
            gridStore.cell(x, j)?.[0] === CellType.START ||
            gridStore.cell(x, j)?.[0] === CellType.END
          )
            continue;
          changeCellType(x, j);
        }
      } else if (lastPointerEnterPos.y - y === 0) {
        // Horizontal line
        const start = Math.min(lastPointerEnterPos.x, x);
        const end = Math.max(lastPointerEnterPos.x, x);
        for (let j = start; j < end; j++) {
          if (
            gridStore.cell(j, y)?.[0] === CellType.START ||
            gridStore.cell(j, y)?.[0] === CellType.END
          )
            continue;
          changeCellType(j, y);
        }
      } else {
        const slope = (lastPointerEnterPos.y - y) / (lastPointerEnterPos.x - x);
        const b = y - slope * x;
        const startX = Math.min(lastPointerEnterPos.x, x);
        const endX = Math.max(lastPointerEnterPos.x, x);
        const startY = Math.min(lastPointerEnterPos.y, y);
        const endY = Math.max(lastPointerEnterPos.y, y);
        for (let j = startY; j <= endY; j += 0.1) {
          for (let i = startX; i <= endX; i += 0.1) {
            if (Math.round(j) === Math.round(slope * i + b)) {
              if (
                gridStore.cell(Math.round(i), Math.round(j))?.[0] ===
                  CellType.START ||
                gridStore.cell(Math.round(i), Math.round(j))?.[0] ===
                  CellType.END
              )
                continue;
              changeCellType(Math.round(i), Math.round(j));
            }
          }
        }
      }
    }
    lastPointerEnterPos.x = x;
    lastPointerEnterPos.y = y;
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

  const { shift, meta, ctrl, y, z, s, l, r } = useMagicKeys({
    passive: false,
    onEventFired(e) {
      if (
        (e.key === "z" ||
          e.key === "y" ||
          e.key === "meta" ||
          e.key === "l" ||
          e.key === "r" ||
          e.key === "s") &&
        e.type === "keydown"
      ) {
        e.preventDefault();
      }
    },
  });

  // Watchers
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
  whenever(s, () => {
    if (!meta.value && !ctrl.value) return;
    saveGrid();
  });
  whenever(l, () => {
    if (!meta.value && !ctrl.value) return;
    if (!gridStore.canPlace) return;
    loadGrid();
  });
  whenever(r, () => {
    if (!meta.value && !ctrl.value) return;
    if (!gridStore.canPlace) return;
    gridStore.resetGrid();
  });

  // Event listeners
  useEventListener("pointermove", (ev) => {
    // if (!isPointerDown.value) return;
    const x = Math.floor(ev.clientX / cellSize);
    const y = Math.floor(ev.clientY / cellSize);
    handlePointerEnter(x, y);
    ev.preventDefault();
    ev.stopPropagation();
  });
  const hasLeft = usePageLeave();
  whenever(hasLeft, () => handlePointerUp(undefined));

  // Lyfecycles
  onMounted(() => loadGrid());
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
      display: block;
      overflow: hidden;
      white-space: nowrap;
      width: 100%;

      &:first-child > * {
        border-top: none;
      }
    }
    .cell {
      box-sizing: border-box;
      border-left: 1px solid #b4b4b4;
      border-top: 1px solid #b4b4b4;
      background-color: transparent;
      display: inline-block;
      aspect-ratio: 1;
      flex: 0 0;
      cursor: pointer;
      user-select: none;
      touch-action: none;
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
        &.exploring-state {
          background-color: #6d77b5;
        }
        &.explored-state {
          background-color: #3e478e;
        }
      }
    }
  }
</style>
