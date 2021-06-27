<template>
  <div class="time-control">
      <span @click="$emit('previousStep')" class="icon material-icons">skip_previous</span>
      <span @click="$emit('run')" class="icon material-icons">{{!running || paused ? 'play_arrow' : 'pause'}}</span>
      <span @click="$emit('nextStep')" class="icon material-icons">skip_next</span>
      <span @click="$emit('stop')" v-if="running || finished" class="icon material-icons">stop</span>
      <span class="text">Speed:</span> 
      <input type="number" :min="1" :max="1000" :value="speed" @input="$emit('update:speed', Number($event.target.value))" />
      <select :value="mode" @change="changeMode($event.target.value)">
          <option v-for="mode in modes" :key="mode">{{mode}}</option>
      </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Mode } from '../brain'
import Input from './Input.vue'

export default defineComponent({
  components: { Input },
  emits: ['run', 'nextStep', 'previousStep', 'stop', 'update:speed', 'update:mode'],
  props: {
      running: {
          type: Boolean,
          default: false
      },
      paused: {
          type: Boolean,
          default: false
      },
      speed: {
          type: Number,
          default: 2
      },
      mode: {
          type: String as PropType<Mode>,
          default: Mode.AM0
      },
      finished: {
          type: Boolean,
          default: false
      }
  },
  setup(props, {emit}) {
      const modes = Object.keys(Mode)

      return {modes, changeMode}

      function changeMode(mode: string) {
          emit('update:mode', mode)
      }
  }
})
</script>

<style scoped>
.time-control {
    grid-column: span 4;
    display: flex;
    align-items: center;
    padding: 0 30px;
    background-color: var(--primary-color);
}

.icon {
    user-select: none;
    margin-right: 20px;
    color: white;
    cursor: pointer;
}

.text {
    margin-right: 10px;
    color: white;
}

input {
    width: 80px;
    height: 30px;
    padding: 0 0 0 10px;
}
</style>
