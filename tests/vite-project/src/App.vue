<script setup lang="ts">
import { ref } from 'vue';
import { getMP4Info } from '../../../src/demux';
import type { VencWorkerOrder, VencWorkerMessage } from '../../../src/type';
import TheWorker from '../../../src/worker?worker';

const DEV = import.meta.env.DEV;

const worker = new TheWorker();

const sizeInput = ref<HTMLInputElement>();
const input = ref<HTMLInputElement>();
const canvas = ref<HTMLCanvasElement>();
const video = ref<HTMLVideoElement>();
const a = ref<HTMLAnchorElement>();
const progress = ref<HTMLProgressElement>();

const size = ref(sizeInput.value?.valueAsNumber || 2048);

/*
const worker = new TheWorker();
console.log(worker);

worker.onmessage = (event) => {
  images.value.push({ comment: 'worker', url: URL.createObjectURL(event.data) });
};
worker.onerror = e => console.error(e);
*/

worker.onmessage = async (ev: MessageEvent<VencWorkerMessage>) => {
  if (ev.data.type === 'progress') {
    progress.value!.max = ev.data.samplesNumber;
    progress.value!.value = ev.data.samplesCount;
    return;
  } else if (ev.data.type === 'result') {
    const file = new File([ev.data.buffer], 'test.mp4', { type: 'video/mp4' });
    const info2 = await getMP4Info(file);
    const newUrl = URL.createObjectURL(file);
    if (a.value) {
      a.value.href = newUrl;
      a.value.download = 'test.mp4';
    }

    if (video.value) {
      video.value.src = newUrl;
    }

    console.log('info2', info2);
  }
}

worker.onerror = (e) => {
  console.error('worker error', e);
}

async function execMain() {
  for (const file of Array.from(input.value?.files ?? [])) {
    worker.postMessage({
      file,
      encoderConfig: {},
      resizeConfig: {
        maxWidth: size.value,
        maxHeight: size.value,
      },
      DEV,
    } as VencWorkerOrder)
  }
}
</script>

<template>
  <div id="myapp">
    <div class="control">
      <input type="file" ref="input" accept="video/*" multiple />
      <input type="number" min="0" step="1" placeholder="size" value="2048" ref="sizeInput"
        @change="size = sizeInput?.valueAsNumber || 2048" />
    </div>

    <div class="do">
      <button @click="execMain()">Main</button>
    </div>

    <main>
      <progress ref="progress"></progress>
      <div>
        <a ref="a">Download</a>
      </div>
      <video ref="video" type="video/mp4" controls></video>
      <canvas ref="canvas" width="2048" height="2048"></canvas>
    </main>
  </div>
</template>

<style>
html,
body {
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

  >* {
    width: 100%;
  }
}

.image {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

a {
  color: #41b883;
}
</style>
