<template>
  <div class="a-star">
    <h1>A*</h1>
    <div class="options">
      <div>
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.canDiagonal"
          label="Allow diagonal"
        />
      </div>
      <div>
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.animate"
          label="Animate"
        />
      </div>
      <div>
        <ElInputNumber
          :disabled="isAnimating"
          :min="10"
          :max="1000"
          :step="10"
          v-model="opts.animationSpeed"
        />
      </div>
    </div>
    <ElButton v-if="!hasStarted" :disabled="!canStart" @click="startAlgorithm">
      START
    </ElButton>
    <template v-else>
      <ElButton :disabled="hasFinished || isAnimating" @click="solve"
        >SOLVE</ElButton
      >
      <ElButton :disabled="hasFinished || isAnimating" @click="nextStep"
        >NEXT</ElButton
      >
      <ElButton :disabled="!canPrevious || isAnimating" @click="previousStep"
        >PREV</ElButton
      >
      <ElButton @click="reset" :disabled="isAnimating">RESET</ElButton>
      <div v-if="opts.animate">
        <ElButton @click="pause" :disabled="!isAnimating">PAUSE</ElButton>
        <ElButton @click="resume" :disabled="isAnimating || hasFinished"
          >RESUME</ElButton
        >
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { useAStar } from "@/algorithm/a-star.js";
  import { useGridStore } from "@/stores/grid.js";
  import { CellState } from "@/types/Cell.js";

  const opts = reactive({
    animate: true,
    animationSpeed: 50,
    canDiagonal: true,
  });

  const gridStore = useGridStore();
  let astar: ReturnType<typeof useAStar> | undefined = undefined;
  const hasStarted = ref(false);
  const canStart = computed(() => gridStore.hasEnd && gridStore.hasStart);
  const hasFinished = ref(false);
  const canPrevious = ref(false);

  const {
    resume,
    pause,
    isActive: isAnimating,
  } = useIntervalFn(
    () => {
      if (hasFinished.value) {
        pause();
      }
      nextStep();
    },
    toRef(opts, "animationSpeed"),
    { immediate: false }
  );

  const startAlgorithm = () => {
    if (!gridStore.grid) return;
    gridStore.canPlace = false;
    hasStarted.value = true;
    astar = useAStar(gridStore.grid, { canDiagonal: opts.canDiagonal });
    gridStore.grid = astar.next();
    if (opts.animate) resume();
  };

  const previousStep = () => {
    if (!hasStarted.value || !astar) return;
    const result = astar.previous();
    if (!result) {
      // Algorithm finished
      canPrevious.value = false;
      return;
    }
    hasFinished.value = false;
    gridStore.grid = result;
    if (!result.flat(1).some((n) => n[1] === CellState.EXPLORING)) {
      canPrevious.value = false;
    }
  };

  const nextStep = () => {
    if (!hasStarted.value || !astar) return;
    const result = astar.next();
    if (!result) {
      // Algorithm finished
      hasFinished.value = true;
      return;
    }
    canPrevious.value = true;
    gridStore.grid = result;
    if (result.flat(1).some((n) => n[1] === CellState.SELECTED)) {
      hasFinished.value = true;
    }
  };

  const reset = () => {
    if (!hasStarted.value || !astar) return;
    gridStore.grid = astar.reset();
    hasFinished.value = false;
    canPrevious.value = false;
    astar = undefined;
    hasStarted.value = false;
    gridStore.canPlace = true;
  };

  const solve = () => {
    if (!hasStarted.value || !astar) return;
    gridStore.grid = astar.solve();
    hasFinished.value = true;
    canPrevious.value = true;
  };
</script>

<style lang="scss" scoped>
  h1 {
    margin: 0;
    padding: 0;
  }
</style>
