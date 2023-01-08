<template>
  <v-layout row align-center justify-center wrap>
    <v-flex>
      <h1>摄像头检测</h1>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <!-- <v-card-actions class="justify-center">
          <v-btn-toggle v-model="withOptions" multiple>
            <v-btn>
              <v-icon>check_box_outline_blank</v-icon>
              <span>Detection</span>
            </v-btn>
            <v-btn>
              <v-icon>how_to_reg</v-icon>
              <span>Recognition</span>
            </v-btn>
          </v-btn-toggle>
        </v-card-actions> -->
        <v-slider v-model="fps" :max="60" :min="1" :step="1" label="Desired FPS" prepend-icon="local_movies"
          thumb-label="always" ticks />
        <p>
          <v-chip label color="orange" text-color="white">
            <v-icon left>
              local_movies
            </v-icon> Real FPS: {{ realFps }}
          </v-chip>
          <v-chip label color="orange" text-color="white">
            <v-icon left>
              timer
            </v-icon> Duration: {{ duration }} ms
          </v-chip>
        </p>
        <v-btn color="primary" dark class="mb-2" @click="startCam()"> 检测</v-btn>
        <v-btn color="primary" dark class="mb-2" @click="stopCam()">停止</v-btn>
      </v-card>
    </v-flex>
    <v-flex xs12 md6>
      <video id="live-video" width="320" height="247" autoplay />
    </v-flex>
    <v-flex xs12 md6>
      <canvas id="live-canvas" width="320" height="247" />
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      interval: null,
      fps: 15,
      realFps: 0,
      step: 2,
      counter: 0,
      progress: 0,
      duration: 0,
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
      //获取视频组件对象
      const videoDiv = document.getElementById('live-video')

      //获取画布组件对象
      const canvasDiv = document.getElementById('live-canvas')

      //获取画布组件上下文,实际绘制在这上面进行
      const canvasCtx = canvasDiv.getContext('2d', { willReadFrequently: true })

      this.start(videoDiv, canvasDiv, canvasCtx, newFps)
    }
  },

  async beforeMount() {
    //挂载前先从服务器获取脸部特征文件，再从特征文件中提取描述器作为匹配器的已知参数
    const self = this
    await self.$store.dispatch('face/getAll')
      .then(() => self.$store.dispatch('face/getMaskModel'))
      .then(() => self.$store.dispatch('face/getFaceMatcher'))
  },

  async mounted() {
    //DOM挂载后，加载摄像头
    // await this.recognize()
  },

  beforeDestroy() {
    //离开页面时关闭摄像头
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.$store.dispatch('camera/stopCamera')
  },

  methods: {
    async startCam() {
      this.recognize()
    },

    stopCam() {
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.$store.dispatch('camera/stopCamera')

      const canvasDiv = document.getElementById('live-canvas')

      //获取画布组件上下文,实际绘制在这上面进行
      const canvasCtx = canvasDiv.getContext('2d', { willReadFrequently: true })
      canvasCtx.clearRect(0, 0, 320, 247)
      this.realFps = 0;
      this.duration = 0
    },

    start(videoDiv, canvasDiv, canvasCtx, fps) {
      const self = this
      if (self.interval) {
        clearInterval(self.interval)
      }
      self.interval = setInterval(async () => {
        const t0 = performance.now()
        //将video组件绘制到canva上
        canvasCtx.drawImage(videoDiv, 0, 0, 320, 247)
        const options = {
          detectionsEnabled: true,
          descriptorsEnabled: true,
        }
        //从视频流中检测人脸
        const detections = await self.$store.dispatch('face/getFaceDetections', { canvas: canvasDiv, options });
        // const maskDetections = await self.$store.dispatch('face/getMaskDetections', { canvas: canvasDiv, options })
        // const maskDetections = await self.$store.dispatch('face/classify', { canvas: canvasDiv });
        // console.log(maskDetections);
        // {
        //     "className": "Mask",
        //     "probability": 0.0063973600044846535
        // }

        if (detections.length) {
          detections.forEach(async (detection) => {
            //添加人脸识别结果
            detection.recognition = await self.$store.dispatch('face/recognize', {
              descriptor: detection.descriptor,
              options
            }),
              //添加口罩识别项
              // detection.maskdetect = await maskDetections
              // console.log(detection, '检测结果')
              //画出识别结果
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
      await self.$store.dispatch('camera/startCamera')
        .then((stream) => {
          const videoDiv = document.getElementById('live-video')
          const canvasDiv = document.getElementById('live-canvas')
          const canvasCtx = canvasDiv.getContext('2d', { willReadFrequently: true })
          videoDiv.srcObject = stream

          self.start(videoDiv, canvasDiv, canvasCtx, self.fps)
        })
    },

  }
}
</script>
