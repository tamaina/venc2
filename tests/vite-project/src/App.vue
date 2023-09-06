<script setup lang="ts">
import { ref, watch } from 'vue';
import { getMp4Info } from '../../../src/get-info';

//import TheWorker from './workers/worker?worker';

const sizeInput = ref<HTMLInputElement>();
const input = ref<HTMLInputElement>();
const canvas = ref<HTMLCanvasElement>();

const size = ref(sizeInput.value?.valueAsNumber || 2048);

/*
const worker = new TheWorker();
console.log(worker);

worker.onmessage = (event) => {
  images.value.push({ comment: 'worker', url: URL.createObjectURL(event.data) });
};
worker.onerror = e => console.error(e);
*/

async function execMain() {
  for (const file of Array.from(input.value?.files ?? [])) {
    console.log(await getMp4Info(file));
  }
}
</script>

<template>
<div id="myapp">
  <div class="control">
    <input type="file" ref="input" accept="video/*" multiple />
    <input type="number" min="0" step="1" placeholder="size" value="2048" ref="sizeInput" @change="size = sizeInput?.valueAsNumber || 2048" />
  </div>

  <div class="do">
    <button @click="execMain()">Main</button>
  </div>

  <main>
  </main>
</div>
</template>

<style>
html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: auto;
  background-color: #0f0f0f;
  color: #f0f0f0;
}

.control {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px 10px;
}

.do {
  padding: 20px 10px;
}

#myapp {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

main {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
}

.image {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}
</style>
