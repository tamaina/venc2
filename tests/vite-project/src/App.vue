<script setup lang="ts">
import { ref, watch } from 'vue';
import { getMP4Info, generateDemuxToVideoTransformer, generateVideoDecodeTransformer } from '../../../src/decode';

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
    console.log(file);
    console.log(await getMP4Info(file));

    const canvasCtx = canvas.value?.getContext('2d');
    if (!canvasCtx) return;

    const preventer = {
      preventCancel: true,
      preventClose: true,
      preventAbort: true,
    };
    const dem = generateDemuxToVideoTransformer();
    //file.stream().pipeThrough(dem).pipeTo(await drawFrames(file, canvas.value!));
    const dec = await generateVideoDecodeTransformer(file);
    let resized = false;
    const s = file.stream().pipeThrough(dem, preventer).pipeThrough(dec, preventer).pipeTo(new WritableStream({
      start() {},
      write(frame) {
        if (!resized) {
          canvas.value!.width = frame.displayWidth;
          canvas.value!.height = frame.displayHeight;
          resized = true;
        }
        canvasCtx.drawImage(frame, 0, 0);
        frame.close();
      },
      close() {},
    }));
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
    <canvas ref="canvas" width="2048" height="2048"></canvas>
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

  > * {
    width: 100%;
  }
}

.image {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}
</style>