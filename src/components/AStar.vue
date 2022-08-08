<template>
  <div class="a-star">
    <h1>A*</h1>
    <div class="options">
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.canDiagonal"
          label="Allow diagonal"
        />
      </div>
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.canSwim"
          label="Allow swimming"
        />
      </div>
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.animate"
          label="Animate"
        /><ElInputNumber
          :disabled="isAnimating"
          :min="10"
          :max="1000"
          :step="10"
          v-model="opts.animationSpeed"
          size="small"
        />
      </div>
      <div class="option"></div>
    </div>
    <ElButton v-if="!hasStarted" :disabled="!canStart" @click="startAlgorithm">
      START
    </ElButton>
    <template v-else>
      <ElButton :disabled="hasFinished || isAnimating" @click="solve"
        >Solve</ElButton
      >
      <ElButton :disabled="hasFinished || isAnimating" @click="nextStep"
        >Next</ElButton
      >
      <ElButton :disabled="!canPrevious || isAnimating" @click="previousStep"
        >Previous</ElButton
      >
      <ElButton @click="reset" :disabled="isAnimating">Stop</ElButton>
      <div v-if="opts.animate">
        <ElButton @click="pause" :disabled="!isAnimating">Pause</ElButton>
        <ElButton @click="resume" :disabled="isAnimating || hasFinished"
          >Play</ElButton
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
    canSwim: true,
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
    astar = useAStar(gridStore.grid, {
      canDiagonal: opts.canDiagonal,
      canSwim: opts.canSwim,
    });
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

  const { arrowleft, arrowright, space } = useMagicKeys();
  whenever(arrowleft, () => {
    if (hasStarted.value && !isAnimating.value && canPrevious.value)
      previousStep();
  });
  whenever(arrowright, () => {
    if (hasStarted.value && !isAnimating.value && !hasFinished.value)
      nextStep();
  });
  whenever(space, () => {
    if (!hasStarted.value) {
      if (canStart.value) startAlgorithm();
      return;
    }
    if (hasFinished.value) {
      reset();
      return;
    }
    if (isAnimating.value) pause();
    else resume();
  });
</script>

<style lang="scss" scoped>
  h1 {
    user-select: none;
  }

  .options {
    margin-top: 10px;
    .option {
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: flex-start;
      align-items: center;
    }
  }
</style>
