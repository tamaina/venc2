<script setup lang="ts">
import { ref } from 'vue';
import { getMP4Info } from '../../../src/demux';
import type { VencWorkerOrder, VencWorkerMessage, VideoEncodeCoderRequests } from '../../../src/type';
import TheWorker from '../../../src/worker?worker';
import OpfsWorker from '../../../src/opfs-worker?worker';
import { EasyVideoEncoder } from '../../../src/index';
import { avc1ProfileToProfileIdTable } from '../../../src/specs/avc1';
import { av01ChromaSubsamplingTable, av01ProfileToProfileIdTable, av01ColorPrimariesTable, av01TransferCharacteristicsTable, av01MatrixCoefficientsTable } from '../../../src/specs/av01';

const sizeInput = ref<HTMLInputElement>();
const bitrateInput = ref<HTMLInputElement>();
const keyFrameMilliSecInput = ref<HTMLInputElement>();
const input = ref<HTMLInputElement>();
const devchk = ref<HTMLInputElement>();
const video = ref<HTMLVideoElement>();
const a = ref<HTMLAnchorElement>();
const progress = ref<HTMLProgressElement>();

const codec = ref<'avc1' | 'av01'>('avc1');
const size = ref(sizeInput.value?.valueAsNumber || 1920);
const bitrate = ref(bitrateInput.value?.valueAsNumber || 1000);
const keyFrameMilliSec = ref(4000);
const hardwareAcceleration = ref<'prefer-hardware' | 'prefer-software' | 'no-preference'>('no-preference');
const decoderHardwareAcceleration = ref<'prefer-hardware' | 'prefer-software' | 'no-preference'>('no-preference');
const bitrateMode = ref<'constant' | 'quantizer' | 'variable'>('variable');
const latencyMode = ref<'quality' | 'realtime'>('quality');

//#region avc1
const avc1Profile = ref<keyof typeof avc1ProfileToProfileIdTable>('main');
//#endregion

//#region av01
const av01Profile = ref<keyof typeof av01ProfileToProfileIdTable>('Main');
const av01SeqTier = ref<string>('M');
const av01Depth = ref<'8' | '10' | '12'>('8');
const av01MonoChrome = ref<HTMLInputElement>();
const av01ChromaSubsampling = ref<keyof typeof av01ChromaSubsamplingTable>('4:2:0');
const av01ColorPrimaries = ref<keyof typeof av01ColorPrimariesTable>('BT_709');
const av01TransferCharacteristics = ref<keyof typeof av01TransferCharacteristicsTable>('BT_709');
const av01MatrixCoefficients = ref<keyof typeof av01MatrixCoefficientsTable>('BT_709');
const av01FullRange = ref<HTMLInputElement>();
//#endregion

function getCodecRequest(): VideoEncodeCoderRequests {
  if (codec.value === 'av01') {
    return {
      type: 'av01',
      profile: av01Profile.value,
      seqTier: av01SeqTier.value,
      depth: av01Depth.value,
      additional: {
        monoChrome: av01MonoChrome.value?.checked ?? false,
        chromaSubsampling: av01ChromaSubsampling.value,
        colorPrimary: av01ColorPrimaries.value,
        transferCharacteristics: av01TransferCharacteristics.value,
        matrixCoefficients: av01MatrixCoefficients.value,
        videoFullRange: av01FullRange.value?.checked ?? false,
      },
    };
  }

  return {
    type: 'avc1',
    profile: avc1Profile.value,
  }
}

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
let worker = null as InstanceType<typeof TheWorker> | null;
let opfsWorker = null as InstanceType<typeof OpfsWorker> | null;
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

async function execWorker() {
  if (!('VideoEncoder' in globalThis) || !('VideoDecoder' in globalThis)) {
    alert('VideoEncoder/VideoDecoder is not supported');
    return;
  }

  if (worker) {
    worker.terminate();
  }
  worker = new TheWorker();

  worker.onmessage = async (ev: MessageEvent<VencWorkerMessage>) => {
    if (ev.data.type === 'progress') {
      progress.value!.max = ev.data.samplesNumber;
      progress.value!.value = ev.data.samplesCount;
      return;
    } else if (ev.data.type === 'segment') {
      if (devchk.value?.checked) console.log('worker segment', ev.data.buffer);
      buffers.add(ev.data.buffer);
    } else if (ev.data.type === 'complete') {
      console.log('worker complete', ev.data);
      if (!devchk.value?.checked) worker?.terminate();
      worker = null;
      await showBuffer();
    } else if (ev.data.type === 'error') {
      console.error('worker error (via message)', ev.data);
      if (!devchk.value?.checked) worker?.terminate();
      worker = null;
      alert(ev.data.error);
    }
  }

  worker.onerror = (e: any) => {
    console.error('worker error (via worker.onerror)', e);
    alert(e);
  }

  for (const file of Array.from(input.value?.files ?? [])) {
    worker.postMessage({
      type: 'encode',
      file,
      videoEncodeCodecRequest: getCodecRequest(),
      videoEncoderConfig: {
        hardwareAcceleration: hardwareAcceleration.value,
        bitrateMode: bitrateMode.value,
        bitrate: bitrate.value * 1000,
        latencyMode: latencyMode.value,
      },
      videoDecoderConfig: {
        hardwareAcceleration: decoderHardwareAcceleration.value,
      },
      resizeConfig: {
        maxWidth: size.value,
        maxHeight: size.value,
      },
      videoKeyframeConfig: {
        type: 'microseconds',
        interval: keyFrameMilliSec.value * 1e3,
      },
      DEV: devchk.value?.checked,
    } as VencWorkerOrder)
  };
}

let prevOpfsIdentifier: string;

async function execOpfsWorker() {
  if (!('VideoEncoder' in globalThis) || !('VideoDecoder' in globalThis)) {
    alert('VideoEncoder/VideoDecoder is not supported');
    return;
  }

  if (opfsWorker) {
    opfsWorker.terminate();
  }
  opfsWorker = new OpfsWorker();

  const identifier = `${crypto.randomUUID()}.mp4`;
  let dstFile: File;

  const opfsRoot = await navigator.storage.getDirectory();

  opfsWorker.onmessage = async (ev: MessageEvent<VencWorkerMessage>) => {
    if (ev.data.type === 'opfs-file-created') {
      console.log(ev.data);
      if (prevOpfsIdentifier) {
        await opfsRoot.removeEntry(prevOpfsIdentifier);
        console.log(`${prevOpfsIdentifier} removed`);
      }
      prevOpfsIdentifier = identifier;
    } else if (ev.data.type === 'progress') {
      progress.value!.max = ev.data.samplesNumber;
      progress.value!.value = ev.data.samplesCount;
      return;
    } else if (ev.data.type === 'complete') {
      console.log('worker complete', ev.data);

      if (!devchk.value?.checked) worker?.terminate();
      worker = null;

      const fileHandle = await opfsRoot.getFileHandle(identifier);
      dstFile = await fileHandle.getFile();
      const newUrl = URL.createObjectURL(dstFile);
      if (a.value) {
        a.value.href = newUrl;
        a.value.download = 'test.mp4';
      }

      if (video.value) {
        video.value.src = newUrl;
      }

      const info2 = await getMP4Info(dstFile);
      console.log('info2 (opfs)', info2);
    } else if (ev.data.type === 'error') {
      console.error('worker error (via message)', ev.data);
      if (!devchk.value?.checked) worker?.terminate();
      worker = null;
      alert(ev.data.error);
    }
  }

  opfsWorker.onerror = (e: any) => {
    console.error('worker error (via worker.onerror)', e);
    alert(e);
  }

  for (const file of Array.from(input.value?.files ?? [])) {
    const info = await getMP4Info(file);
    console.log('info (opfs)', info);

    opfsWorker.postMessage({
      type: 'encode',
      identifier,
      file,
      videoEncodeCodecRequest: getCodecRequest(),
      videoEncoderConfig: {
        hardwareAcceleration: hardwareAcceleration.value,
        bitrateMode: bitrateMode.value,
        bitrate: bitrate.value * 1000,
        latencyMode: latencyMode.value,
      },
      videoDecoderConfig: {
        hardwareAcceleration: decoderHardwareAcceleration.value,
      },
      resizeConfig: {
        maxWidth: size.value,
        maxHeight: size.value,
      },
      videoKeyframeConfig: {
        type: 'microseconds',
        interval: keyFrameMilliSec.value * 1e3,
      },
      DEV: devchk.value?.checked,
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
      videoEncodeCodecRequest: getCodecRequest(),
      videoEncoderConfig: {
        hardwareAcceleration: hardwareAcceleration.value,
        bitrateMode: bitrateMode.value,
        bitrate: bitrate.value * 1000,
        latencyMode: latencyMode.value,
      },
      videoDecoderConfig: {
        hardwareAcceleration: decoderHardwareAcceleration.value,
      },
      resizeConfig: {
        maxWidth: size.value,
        maxHeight: size.value,
      },
      videoKeyframeConfig: {
        type: 'microseconds',
        interval: keyFrameMilliSec.value * 1e3,
      },
      DEV: devchk.value?.checked,
    });
  }
}
</script>

<template>
  <div id="myapp">
    <div>
      <h1>Easy Video Encoder for browsers (tentative)</h1>
      <a href="https://github.com/tamaina/venc2">https://github.com/tamaina/venc2</a>
    </div>

    <div class="panel">
      <input type="file" ref="input" accept="video/*" />
      <select v-model="decoderHardwareAcceleration">
        <option value="no-preference">decoder no-preference</option>
        <option value="prefer-hardware">decoder prefer-hardware</option>
        <option value="prefer-software">decoder prefer-software</option>
      </select>
    </div>

    <div class="panel">
      <div>
        W=
        <input type="number" min="0" step="1" placeholder="size" value="1920" ref="sizeInput"
          @change="size = sizeInput?.valueAsNumber || 1920" style="width: 4.1em; font-family: monospace;" />
      </div>
      <div>
        <input type="number" min="0" step="1" placeholder="kbps" value="1000" ref="bitrateInput"
          @change="bitrate = bitrateInput?.valueAsNumber || 1000" style="width: 4.1em; font-family: monospace;" />
        kbps
      </div>
      <div>
        KeyFrame
        <input type="number" min="0" step="0.001" placeholder="ms" value="4000" ref="keyFrameMilliSecInput"
          @change="keyFrameMilliSec = keyFrameMilliSecInput?.valueAsNumber || 4000" style="width: 5em; font-family: monospace;" />
        ms
      </div>
      <select v-model="hardwareAcceleration">
        <option value="no-preference">no-preference</option>
        <option value="prefer-hardware">prefer-hardware</option>
        <option value="prefer-software">prefer-software</option>
      </select>
      <select v-model="bitrateMode">
        <option value="constant">constant</option>
        <option value="quantizer">quantizer</option>
        <option value="variable">variable</option>
      </select>
      <select v-model="latencyMode">
        <option value="quality">latency: quality</option>
        <option value="realtime">latency: realtime</option>
      </select>
    </div>

    <div class="panel codec">
      <button @click="codec = 'avc1'">avc1 (H264)</button>
      <button @click="codec = 'av01'">av01</button>
      <div>
        <input type="checkbox" ref="devchk" id="devchk" />
        <label for="devchk">DEV</label>
      </div>
    </div>

    <div class="panel control">
      <template v-if="codec === 'avc1'">
        <select v-model="avc1Profile">
          <option v-for="(p, k) in avc1ProfileToProfileIdTable" :value="k" v-text="k" />
        </select>
      </template>
      <template v-else-if="codec === 'av01'">
        <select v-model="av01Profile">
          <option v-for="(p, k) in av01ProfileToProfileIdTable" :value="k" v-text="k" />
        </select>
        <select v-model="av01SeqTier">
          <option value="M">M</option>
          <option value="H">H</option>
          <option value="V">V</option>
        </select>
        <select v-model="av01Depth">
          <option value="8">8bit</option>
          <option value="10">10bit</option>
          <option value="12">12bit</option>
        </select>
        <div>
          <input type="checkbox" ref="av01MonoChrome" id="av01MonoChrome" />
          <label for="av01MonoChrome">MonoChrome</label>
        </div>
        <select v-model="av01ChromaSubsampling">
          <option v-for="(p, k) in av01ChromaSubsamplingTable" :value="k" v-text="k" />
        </select>
        <select v-model="av01ColorPrimaries">
          <option v-for="(p, k) in av01ColorPrimariesTable" :value="k" v-text="`CP_${k}`" />
        </select>
        <select v-model="av01TransferCharacteristics">
          <option v-for="(p, k) in av01TransferCharacteristicsTable" :value="k" v-text="`TC_${k}`" />
        </select>
        <select v-model="av01MatrixCoefficients">
          <option v-for="(p, k) in av01MatrixCoefficientsTable" :value="k" v-text="`MC_${k}`" />
        </select>
        <div>
          <input type="checkbox" ref="av01FullRange" id="av01FullRange" />
          <label for="av01FullRange">FullRange</label>
        </div>
      </template>
    </div>

    <div class="panel do">
      <button @click="execOpfsWorker()">Worker (OPFS)</button>
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

.panel {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  margin: .4em;
}

.panel > * {
  margin: 4px;
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
