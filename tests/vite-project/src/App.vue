<script setup lang="ts">
import { ref } from 'vue';
import { createFile } from '@webav/mp4box.js';
import { calculateSize } from '@misskey-dev/browser-image-resizer';
import { generateVideoDecodeTransformer, generateSampleToEncodedVideoChunkTransformer } from '../../../src/decode';
import { getMP4Info, generateDemuxTransformer, pickTransformer } from '../../../src/demux';
import { floorWithSignificance, generateResizeTransformer, generateVideoSortTransformer } from '../../../src/transform';
import { generateVideoEncoderTransformStream, writeAudioSamplesToMP4File, writeEncodedVideoChunksToMP4File } from '../../../src/encode';

const DEV = import.meta.env.DEV;

//import TheWorker from './workers/worker?worker';

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

async function execMain() {
  for (const file of Array.from(input.value?.files ?? [])) {
    console.log(file);
    const info = await getMP4Info(file);
    console.log(info);

    if (progress.value) {
      progress.value.max = info.audioInfo ? info.videoInfo.nb_samples + info.audioInfo.nb_samples : info.videoInfo.nb_samples;
      progress.value.value = 0;
    }

    const canvasCtx = canvas.value?.getContext('2d');
    if (!canvasCtx) return;

    const preventer = {
      preventCancel: true,
      preventClose: true,
      preventAbort: true,
    };

    const resizeConfig = { maxWidth: 1280, maxHeight: 1280 };
    const _outputSize = calculateSize(info.videoInfo.video, resizeConfig);
    const outputSize = {
      width: floorWithSignificance(_outputSize.width, 2),
      height: floorWithSignificance(_outputSize.height, 2),
    };
    const encoderConfig = {
      codec: 'avc1.4d0034',
      ...outputSize,
    };

    let resized = false;
    const dstFile = createFile();
    const [f1, f2] = file.stream().pipeThrough(generateDemuxTransformer(), preventer).tee();
    const promises = [];
    if (info.audioInfo) {
      promises.push(f1
        .pipeThrough(pickTransformer(info.audioInfo.id))
        .pipeTo(writeAudioSamplesToMP4File(dstFile, info.audioInfo))
      );
    }

    promises.push(f2
      .pipeThrough(pickTransformer(info.videoInfo.id))
      .pipeThrough(generateSampleToEncodedVideoChunkTransformer())
      .pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description), preventer)
      .pipeThrough(generateVideoSortTransformer(info.videoInfo), preventer)
      .pipeThrough(generateResizeTransformer(resizeConfig))
      .pipeThrough(generateVideoEncoderTransformStream(encoderConfig), preventer)
      .pipeThrough(new TransformStream({
        start() {},
        transform(chunk, controller) {
          controller.enqueue(chunk);
          if (progress.value) {
            progress.value.value += 1;
          }
        },
        flush() {},
      }))
      .pipeTo(writeEncodedVideoChunksToMP4File(dstFile, encoderConfig, info.videoInfo))
    );

    await Promise.all(promises);

    if (progress.value) {
      progress.value.value = progress.value.max;
    }

    if (dstFile.moov) {
      const _1904 = new Date('1904-01-01T00:00:00Z').getTime();
      (dstFile.moov as any).mvhd?.set('creation_time', Math.floor((info.info.created.getTime() - _1904) / 1000));
      (dstFile.moov as any).mvhd?.set('modification_time', Math.floor((Date.now() - _1904) / 1000));
      (dstFile.moov as any).mvhd?.set('timescale', info.info.timescale);
      (dstFile.moov as any).mvhd?.set('duration', info.info.duration);
    }
    // NEVER execute initializeSegmentation
    const buf = dstFile.getBuffer();
    console.log('result: resized!', file.size, buf.byteLength);

    const info2 = await getMP4Info(new File([buf], 'test.mp4', { type: 'video/mp4' }));
    const newUrl = URL.createObjectURL(new Blob([buf], { type: 'video/mp4' }));;
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

a {
  color: #41b883;
}
</style>
