<template>
  <v-layout row align-center justify-center wrap>
    <v-flex>
      <v-file-input accept="image/*" label="File input"></v-file-input>
      <v-img lazy-src="https://picsum.photos/id/11/10/6" max-height="150" max-width="250"
        src="https://picsum.photos/id/11/500/300"></v-img>
      <v-btn>检测</v-btn>
    </v-flex>
    <v-flex>
      <h1>Recognize</h1>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      url: 'https://teachablemachine.withgoogle.com/models/hBKYa4zJe/',
      interval: null,
      fps: 15,
      realFps: 0,
      step: 2,
      counter: 0,
      progress: 0,
      duration: 0,
      isProgressActive: true,
      recognition: '',
      withOptions: [0, 1, 2, 3]
    }
  },
  computed: {
    models() {
      return this.$store.state.model.list
    }
  },

  watch: {
    fps(newFps) {
      const videoDiv = document.getElementById('live-video')
      const canvasDiv = document.getElementById('live-canvas')
      const canvasCtx = canvasDiv.getContext('2d')
      this.start(videoDiv, canvasDiv, canvasCtx, newFps)
    }
  },

  async beforeMount() {
    const self = this
    await self.$store.dispatch('face/getAll')
      .then(() => self.$store.dispatch('face/getFaceMatcher'))

    //todo
  },

  async mounted() {
    await this.recognize()
  },

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.$store.dispatch('camera/stopCamera')
  },

  methods: {
    start(videoDiv, canvasDiv, canvasCtx, fps) {
      const self = this
      if (self.interval) {
        clearInterval(self.interval)
      }
      self.interval = setInterval(async () => {
        const t0 = performance.now()
        canvasCtx.drawImage(videoDiv, 0, 0, 320, 247)
        const options = {
          detectionsEnabled: self.withOptions.find(o => o === 0) === 0,
          landmarksEnabled: self.withOptions.find(o => o === 1) === 1,
          descriptorsEnabled: self.withOptions.find(o => o === 2) === 2,
          expressionsEnabled: self.withOptions.find(o => o === 3) === 3
        }
        const detections = await self.$store.dispatch('face/getFaceDetections', { canvas: canvasDiv, options })
        const maskDetections = await self.$store.dispatch('face/getMaskDetections', { canvas: canvasDiv, options })
        // console.log(maskDetections);
        // console.log(detections);

        if (detections.length) {
          if (self.isProgressActive) {
            self.increaseProgress()
            self.isProgressActive = false
          }
          detections.forEach(async (detection) => {
            detection.recognition = await self.$store.dispatch('face/recognize', {
              descriptor: detection.descriptor,
              options
            }),
              detection.maskdetect = await maskDetections
            // console.log(detection, '检测结果')
            self.$store.dispatch('face/draw',
              {
                canvasDiv,
                canvasCtx,
                detection,
                options
              })
          })
        }
        const t1 = performance.now()
        self.duration = (t1 - t0).toFixed(2)
        self.realFps = (1000 / (t1 - t0)).toFixed(2)
      }, 1000 / fps)
    },
    async recognize() {
      const self = this
      self.increaseProgress()
      await self.$store.dispatch('camera/startCamera')
        .then((stream) => {
          const videoDiv = document.getElementById('live-video')
          const canvasDiv = document.getElementById('live-canvas')
          const canvasCtx = canvasDiv.getContext('2d')
          videoDiv.srcObject = stream

          self.increaseProgress()
          self.start(videoDiv, canvasDiv, canvasCtx, self.fps)
        })
    },

    increaseProgress() {
      const self = this
      self.progress = (100 / self.step) * ++self.counter
    }
  }
}
</script>
