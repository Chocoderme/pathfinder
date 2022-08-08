<template>
  <div class="tile-menu">
    <h1>Tiles</h1>
    <ElTooltip placement="right">
      <template #content
        ><span class="capitalize">{{ gridStore.placing }}</span
        ><br />{{ tileHelpText }}</template
      >
      <div class="help">
        <ElIcon size="small"><QuestionFilled /></ElIcon>
      </div>
    </ElTooltip>

    <div class="tiles">
      <div
        v-for="tile of tiles"
        :key="tile"
        class="tile"
        :class="{ [tile]: true, active: gridStore.placing === tile }"
        @click.prevent="gridStore.placing = tile"
      ></div>
      <transition name="el-fade-in" mode="out-in">
        <label :key="gridStore.placing" class="tile-name capitalize">{{
          gridStore.placing
        }}</label>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useGridStore } from "@/stores/grid";
  import { CellType } from "@/types/Cell";
  import { QuestionFilled } from "@element-plus/icons-vue";

  const gridStore = useGridStore();
  const tiles = Object.values(CellType);

  const tileHelpText = computed(() => {
    switch (gridStore.placing) {
      case CellType.END:
        return "Destination / exit point";
      case CellType.START:
        return "Start point";
      case CellType.GROUND:
        return "Walkable tile";
      case CellType.WALL:
        return "Blocking tile";
      case CellType.WATER:
        return "1 tile can be jumped over, more is blocking";
    }
  });

  const keys = useMagicKeys();
  whenever(keys["1"], () => {
    gridStore.placing = tiles[0];
  });
  whenever(keys["2"], () => {
    gridStore.placing = tiles[1];
  });
  whenever(keys["3"], () => {
    gridStore.placing = tiles[2];
  });
  whenever(keys["4"], () => {
    gridStore.placing = tiles[3];
  });
  whenever(keys["5"], () => {
    gridStore.placing = tiles[4];
  });
</script>

<style lang="scss" scoped>
  .tile-menu {
    width: max-content;
    height: max-content;
    min-width: 200px;

    h1 {
      user-select: none;
    }

    .help {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    label {
      transition-duration: 0.15s !important;
      padding-left: 10px;
    }

    .tiles {
      display: flex;
      flex-direction: row;
      gap: 5px;
      margin-top: 10px;
    }

    .tile {
      height: 20px;
      width: 20px;
      border: 1px solid black;
      border-radius: 8px;
      cursor: pointer;
      transition: border 0.2s ease-in-out;
      box-sizing: border-box;

      &.start {
        background-color: #44bd32;
      }

      &.end {
        background-color: #c23616;
      }

      &.wall {
        background-color: #353b48;
      }

      &.water {
        background-color: #487eb0;
      }

      &.active {
        border: 2px solid blueviolet;
      }
    }
  }
</style>
