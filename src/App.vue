<template>
    <time-control
        v-if="mode === 'C0'"
        @run="cRun"
        @nextStep="cRunStep"
        @stop="cReset"
        :running="cRunning"
        :paused="cPaused"
        v-model:speed="speed"
        :finished="cFinished"
        v-model:mode="mode"
    ></time-control>
    <time-control
    v-else
        @run="run"
        @nextStep="runStep"
        @stop="reset"
        :running="running"
        :paused="paused"
        v-model:speed="speed"
        :finished="finished"
        v-model:mode="mode"
    ></time-control>
    <template v-if="mode === 'AM0' || mode === 'AM1'">
        <instruction
            v-model="instructions"
            :counter="counter"
            :running="running"
            @pause="pause"
            :mode="mode"
        ></instruction>
        <main-storage v-model="mainStorage" :speed="speed"></main-storage>
        <stack v-model="stack" :speed="speed"></stack>
        <in v-model="input"></in>
        <out v-model="output"></out>
    </template>
    <template v-else>
        <coder
            v-model="code"
            :counter="counter"
            :running="running"
            @pause="pause"
            :mode="mode"
        ></coder>
        <compiler :displayStates="displayStates" :error="error"></compiler>
        {{nextCompilers}}
    </template>
    <!-- <instruction-counter v-model="counter"></instruction-counter> -->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import In from "./components/Input.vue";
import InstructionCounter from "./components/InstructionCounter.vue";
import Out from "./components/Output.vue";
import MainStorage from "./components/MainStorage.vue";
import Stack from "./components/Stack.vue";
import Instruction from "./components/Instruction.vue";
import Coder from "./components/Coder.vue";
import TimeControl from "./components/TimeControl.vue";
import Compiler from "./components/Compiler.vue";
import { machine } from "./brain";
import { compiler } from "./compiler";

export default defineComponent({
    name: "App",
    components: {
        In,
        InstructionCounter,
        Out,
        MainStorage,
        Stack,
        Instruction,
        TimeControl,
        Compiler,
        Coder,
    },
    setup(props) {
        const {
            counter,
            instructions,
            mainStorage,
            input,
            output,
            stack,
            run,
            runStep,
            reset,
            pause,
            running,
            paused,
            speed,
            finished,
            mode,
            code,
        } = machine();

        const {
            tab,
            program,
            run: cRun,
            runStep: cRunStep,
            displayStates,
            nextCompilers,
            reset: cReset,
            finished: cFinished,
            error,
            pause: cPause,
            running: cRunning,
            paused: cPaused,
        } = compiler(code, speed);

        return {
            tab,
            program,
            displayStates,
            counter,
            instructions,
            mainStorage,
            error,
            input,
            output,
            stack,
            speed,
            mode,
            code,
            run,
            runStep,
            nextCompilers,
            reset,
            pause, finished, running, paused,
            cRun,  cRunStep,  cReset, cPaused, cPause, cFinished, cRunning
        };
    },
});
</script>

<style lang="css">
* {
    box-sizing: border-box;
}

body {
    margin: 0;
}
#app {
    --primary-color: #4b6ffe;
    --gray: rgb(210, 210, 210);
    --light-gray: rgb(245, 245, 245);
    --dark-gray: rgb(100, 100, 100);
    margin: 0;
    height: 100vh;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 64px 1fr 1fr 1fr;
    font-family: "Roboto", sans-serif;
}

input {
    border: none;
    outline: none;
}
</style>
