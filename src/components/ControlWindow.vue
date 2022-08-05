<template>
  <div ref="controlWindowRef" :style="style" class="control-window">
    <slot />
  </div>
</template>

<script lang="ts" setup>
  const controlWindowRef = ref<HTMLDivElement | undefined>();
  const { style } = useDraggable(controlWindowRef, {
    initialValue: { x: 40, y: 30 },
  });
</script>

<style lang="scss" scoped>
  .control-window {
    position: fixed;
    top: 30px;
    left: 40px;
    padding: 20px;
    border-radius: 5px;
    background: whitesmoke;
    border: 1px solid black;
    cursor: move;
    width: 250px;
  }
</style>
