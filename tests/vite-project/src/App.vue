<script setup lang="ts">
import { ref } from 'vue';
import { getMP4Info } from '../../../src/demux';
import type { VencWorkerOrder, VencWorkerMessage } from '../../../src/type';
import TheWorker from '../../../src/worker?worker';
import { EasyVideoEncoder } from '../../../src/index';

const DEV = import.meta.env.DEV;

const worker = new TheWorker();

const sizeInput = ref<HTMLInputElement>();
const input = ref<HTMLInputElement>();
const video = ref<HTMLVideoElement>();
const a = ref<HTMLAnchorElement>();
const progress = ref<HTMLProgressElement>();

const size = ref(sizeInput.value?.valueAsNumber || 1920);

const main = new EasyVideoEncoder();

/*
const worker = new TheWorker();
console.log(worker);

worker.onmessage = (event) => {
  images.value.push({ comment: 'worker', url: URL.createObjectURL(event.data) });
};
worker.onerror = e => console.error(e);
*/

let buffers = new Set<ArrayBuffer>();

async function showBuffer() {
  console.log('buffers', buffers);
  const file = new File(Array.from(buffers), 'test.mp4', { type: 'video/mp4' });
  console.log(file);
  buffers = new Set();
  const newUrl = URL.createObjectURL(file);
  if (a.value) {
    a.value.href = newUrl;
    a.value.download = 'test.mp4';
  }

  if (video.value) {
    video.value.src = newUrl;
  }

  const info2 = await getMP4Info(file);
  console.log('info2', info2);
}

worker.onmessage = async (ev: MessageEvent<VencWorkerMessage>) => {
  if (ev.data.type === 'progress') {
    progress.value!.max = ev.data.samplesNumber;
    progress.value!.value = ev.data.samplesCount;
    return;
  } else if (ev.data.type === 'segment') {
    console.log('worker segment', ev.data.buffer);
    buffers.add(ev.data.buffer);
  } else if (ev.data.type === 'complete') {
    console.log('worker complete', ev.data);
    await showBuffer();
  }
}

worker.onerror = (e: any) => {
  console.error('worker error', e);
}

async function execWorker() {
  if (!('VideoEncoder' in globalThis) || !('VideoDecoder' in globalThis)) {
    alert('VideoEncoder/VideoDecoder is not supported');
    return;
  }

  for (const file of Array.from(input.value?.files ?? [])) {
    worker.postMessage({
      file,
      videoEncoderConfig: {},
      resizeConfig: {
        maxWidth: size.value,
        maxHeight: size.value,
      },
      DEV,
    } as VencWorkerOrder)
  };
}

main.addEventListener('progress', (ev) => {
  progress.value!.max = ev.detail.samplesNumber;
  progress.value!.value = ev.detail.samplesCount;
});

main.addEventListener('segment', async (ev) => {
  console.log('main segment', ev.detail);
  buffers.add(ev.detail.buffer);
});

main.addEventListener('complete', async (ev) => {
  console.log('main complete', ev.detail);
  await showBuffer();
});

function execMain() {
  if (!('VideoEncoder' in globalThis) || !('VideoDecoder' in globalThis)) {
    alert('VideoEncoder/VideoDecoder is not supported');
    return;
  }

  for (const file of Array.from(input.value?.files ?? [])) {
    main.start({
      file,
      videoEncoderConfig: {},
      resizeConfig: {
        maxWidth: size.value,
        maxHeight: size.value,
      },
      DEV,
    } as VencWorkerOrder);
  }
}
</script>

<template>
  <div id="myapp">
    <div>
      <h1>Easy Video Encoder for browsers (tentative)</h1>
      <a href="https://github.com/tamaina/venc2">https://github.com/tamaina/venc2</a>
    </div>
    <div class="control">
      <input type="file" ref="input" accept="video/*" multiple />
      <input type="number" min="0" step="1" placeholder="size" value="1920" ref="sizeInput"
        @change="size = sizeInput?.valueAsNumber || 1920" />
    </div>

    <div class="do">
      <button @click="execWorker()">Worker</button>
      <button @click="execMain()">Main</button>
    </div>

    <main>
      <progress ref="progress"></progress>
      <div>
        <a ref="a">Download</a>
      </div>
      <video ref="video" type="video/mp4" controls></video>
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

h1 {
  margin: 1rem;
  line-height: 1.1;
}

.control {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  padding: 20px 10px;
}

.control > * {
  margin: 4px;
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
