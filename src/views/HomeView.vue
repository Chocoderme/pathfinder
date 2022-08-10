<script setup lang="ts"></script>

<template>
  <main>
    <Grid />
    <ControlWindow storage-key="tile-window-position">
      <TileMenu />
    </ControlWindow>
    <ControlWindow storage-key="algorithm-window-position" :offset="{ y: 100 }">
      <AStar />
    </ControlWindow>
    <KeyboardShortcutsHelp />
  </main>
</template>

<style lang="scss" scoped>
  main {
    position: absolute;
    inset: 0;
  }

  .pathfinder {
    width: 100dvw;
    height: 100dvh;
  }
</style>
