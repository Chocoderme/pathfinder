<template>
  <div class="a-star">
    <h1>A*</h1>
    <div class="options">
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.canHorizontal"
          label="Allow horizontal"
        />
        <transition name="el-fade-in">
          <div v-if="opts.canHorizontal">
            <label class="label">Cost:</label>
            <ElInputNumber
              :disabled="hasStarted"
              :min="0"
              :max="10"
              :step="0.1"
              controls-position="right"
              v-model="opts.horizontalCost"
              size="small"
            />
          </div>
        </transition>
      </div>
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.canVertical"
          label="Allow vertical"
        />
        <transition name="el-fade-in">
          <div v-if="opts.canVertical">
            <label class="label">Cost:</label>
            <ElInputNumber
              :disabled="hasStarted"
              :min="0"
              :max="10"
              :step="0.1"
              controls-position="right"
              v-model="opts.verticalCost"
              size="small"
            />
          </div>
        </transition>
      </div>
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.canDiagonal"
          label="Allow diagonal"
        />
        <transition name="el-fade-in">
          <div v-if="opts.canDiagonal">
            <label class="label">Cost:</label>
            <ElInputNumber
              :disabled="hasStarted"
              :min="0"
              :max="10"
              :step="0.1"
              controls-position="right"
              v-model="opts.diagonalCost"
              size="small"
            />
          </div>
        </transition>
      </div>
      <div class="option">
        <div class="group">
          <ElCheckbox
            :disabled="hasStarted"
            v-model="opts.canJump"
            label="Allow jumping"
          />
          <ElTooltip
            content="Can traverse exactly one tile of water (Cost will be added to movement cost)"
            placement="top"
          >
            <ElIcon size="small"><QuestionFilled /></ElIcon>
          </ElTooltip>
        </div>
        <transition name="el-fade-in">
          <div v-if="opts.canJump">
            <label class="label">Cost:</label>
            <ElInputNumber
              :disabled="hasStarted"
              :min="0"
              :max="10"
              :step="0.1"
              controls-position="right"
              v-model="opts.jumpCost"
              size="small"
            />
          </div>
        </transition>
      </div>
      <div class="option">
        <div class="group">
          <ElCheckbox
            :disabled="hasStarted"
            v-model="opts.canSwim"
            label="Allow swimming"
          />
          <ElTooltip
            content="Can traverse multiple tiles of water (Cost will be added to movement cost)"
            placement="top"
          >
            <ElIcon size="small"><QuestionFilled /></ElIcon>
          </ElTooltip>
        </div>
        <transition name="el-fade-in">
          <div v-if="opts.canSwim">
            <label class="label">Cost:</label>
            <ElInputNumber
              :disabled="hasStarted"
              :min="0"
              :max="10"
              :step="0.1"
              controls-position="right"
              v-model="opts.swimCost"
              size="small"
            />
          </div>
        </transition>
      </div>
      <div class="option">
        <ElCheckbox
          :disabled="hasStarted"
          v-model="opts.animate"
          label="Animate"
        />
        <transition name="el-fade-in">
          <div v-if="opts.animate">
            <label class="label">Speed:</label
            ><ElInputNumber
              label="Animation speed"
              :disabled="isAnimating"
              :min="10"
              :max="1000"
              :step="10"
              v-model="opts.animationSpeed"
              controls-position="right"
              size="small"
            />
          </div>
        </transition>
      </div>
      <div class="option"></div>
    </div>
    <ElButton v-if="!hasStarted" :disabled="!canStart" @click="startAlgorithm">
      Start
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
  import { QuestionFilled } from "@element-plus/icons-vue";
  // import { ElMessage } from "element-plus";

  const opts = reactive({
    animate: true,
    animationSpeed: 50,
    canHorizontal: true,
    canVertical: true,
    canDiagonal: true,
    canSwim: true,
    canJump: true,
    horizontalCost: 1,
    verticalCost: 1,
    diagonalCost: 1.8,
    jumpCost: 1,
    swimCost: 1,
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
      canHorizontal: opts.canHorizontal,
      canVertical: opts.canVertical,
      canDiagonal: opts.canDiagonal,
      canSwim: opts.canSwim,
      canJump: opts.canJump,
      diagonalCost: opts.diagonalCost,
      verticalCost: opts.verticalCost,
      horizontalCost: opts.horizontalCost,
      jumpCost: opts.jumpCost,
      swimCost: opts.swimCost,
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

  const solve = async () => {
    if (!hasStarted.value || !astar) return;
    gridStore.grid = await astar.solve();
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
  whenever(hasFinished, () => {
    if (!gridStore.grid) return;
    if (
      !gridStore.grid.flat(1).some((cell) => cell[1] === CellState.SELECTED)
    ) {
      ElMessage({
        message: "No solution found!",
        type: "error",
        showClose: false,
        icon: undefined,
        grouping: true,
      });
    }
  });
</script>

<style lang="scss" scoped>
  h1 {
    user-select: none;
  }

  .options {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    :deep(.el-checkbox) {
      height: 20px;
    }

    .option {
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: space-between;
      align-items: center;

      .group {
        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: flex-start;
        align-items: center;
      }

      .label {
        color: #666;
        font-size: 12px;
        margin-right: 5px;
      }
    }
  }
</style>
