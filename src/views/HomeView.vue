<script setup lang="ts"></script>

<template>
  <main>
    <Grid />
    <ControlWindow>
      <AStar />
    </ControlWindow>
  </main>
</template>

<style lang="scss" scoped>
  main {
    position: absolute;
    inset: 0;
    background-color: #e3e3e3;
  }

  .pathfinder {
    width: 100dvw;
    height: 100dvh;
  }
</style>
