<template>
  <div class="keyboard-shortcuts-help">
    <ElIcon @click="dialogVisible = true" size="large"
      ><QuestionFilled
    /></ElIcon>
    <ElDialog
      v-model="dialogVisible"
      title="Keyboard shortcuts"
      width="min(400px, 80vw)"
      :z-index="5000"
      append-to-body
      show-close
      center
      close-on-press-escape
      close-on-click-modal
      custom-class="keyboard-shortcuts-help-dialog"
    >
      <ul class="shortcuts">
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">Z</span>
            </div>
          </div>
          <label>Undo</label>
        </li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">Y</span>
            </div>
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">⇧</span> +
              <span class="key">Z</span>
            </div>
          </div>
          <label>Redo</label>
        </li>
        <li><ElDivider /></li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">SPACE</span>
            </div>
          </div>
          <label>Start / Play / Pause</label>
        </li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">&larr;</span>
            </div>
          </div>
          <label>Previous</label>
        </li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">&rarr;</span>
            </div>
          </div>
          <label>Next</label>
        </li>
        <li><ElDivider /></li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">R</span>
            </div>
          </div>
          <label>Reset grid</label>
        </li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">S</span>
            </div>
          </div>
          <label>Save grid</label>
        </li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">L</span>
            </div>
          </div>
          <label>Load grid</label>
        </li>
        <li><ElDivider /></li>
        <li class="shortcut">
          <div class="keys">
            <div>
              <span class="key">CTRL / ⌘</span> + <span class="key">/</span>
            </div>
          </div>
          <label>Show this help</label>
        </li>
      </ul>
    </ElDialog>
  </div>
</template>

<script lang="ts" setup>
import { QuestionFilled } from "@element-plus/icons-vue";

const dialogVisible = ref(false);

useMagicKeys({
  passive: false,
  onEventFired(e) {
    console.log(e.key, e.type, e.ctrlKey);
    if (e.key === "/" && e.type === "keydown" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      dialogVisible.value = true;
    }
  },
});
</script>

<style lang="scss" scoped>
.keyboard-shortcuts-help {
  position: fixed;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>
<style lang="scss">
.keyboard-shortcuts-help-dialog {
  border-radius: 12px;
  .el-dialog__body {
    padding: 20px;
  }

  .el-divider {
    margin: 5px 0;
  }

  .shortcuts {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: rgb(96, 98, 102);

    .key {
      display: inline-block;
      padding: 5px 10px;
      border: 1px solid #888;
      border-radius: 3px;
      text-transform: capitalize;
    }

    .shortcut {
      display: flex;
      flex-direction: row;
      gap: 30px;
      justify-content: space-between;
      align-items: center;

      & > .keys {
        display: flex;
        flex-direction: column;
        gap: 5px;
        justify-content: flex-start;
        align-items: flex-start;
      }
    }

    label {
      font-size: 16.8px;
      color: #333;
    }
  }
}
</style>
