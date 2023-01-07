<template>
  <v-layout row align-center justify-center wrap>
    <v-flex>
      <h1>上传图片检测</h1>
    </v-flex>

    <v-snackbar v-model="imgalert">
      请上传图片
      <template v-slot:action="{ attrs }">
        <v-btn color="red" text v-bind="attrs" @click="imgalert = false">
          关闭
        </v-btn>
      </template>
    </v-snackbar>
    <v-flex>
      <v-card flat>
        <form method="POST" class="form-documents" enctype="multipart/form-data">
          上传图片
          <input id="fileUpload" @change="filesChange($event)" type="file" name="fileUpload">
        </form>
      </v-card>
      <v-btn @click="start()" class="mb-2" color="primary" dark>检测</v-btn>
    </v-flex>
    <v-flex xs12 md6>
      <img :id="faceImg" :src="faceImg" width="320" height="247">
      <v-btn @click="clear" class="mb-2" small color="primary" dark>
        清除</v-btn>
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
      faceImg: null,
      imgalert: null
    }
  },
  computed: {
  },

  watch: {
  },


  async beforeMount() {
    const self = this
    await self.$store.dispatch('face/getAll')
      .then(() => self.$store.dispatch('face/getFaceMatcher'))

  },

  async mounted() {
  },

  beforeDestroy() {
  },

  methods: {
    //每上传一张图片就上传到服务器
    filesChange(e) {
      const self = this
      let files = e.target.files[0];//图片文件名
      if (!e || !window.FileReader) return; // 看是否支持FileReader
      let reader = new FileReader();
      reader.readAsDataURL(files); // 关键一步，在这里转换的
      reader.onloadend = function () {
        self.faceImg = this.result;//赋值
      }

    },
    clear() {
      this.faceImg = null
    },
    start(videoDiv, canvasDiv, canvasCtx, fps) {
      if (this.faceImg) {
        const self = this
        if (self.interval) {
          clearInterval(self.interval)
        }
        self.interval = setInterval(async () => {
          const t0 = performance.now()
          //将video组件绘制到canva上
          canvasCtx.drawImage(videoDiv, 0, 0, 320, 247)
          const options = {
            detectionsEnabled: self.withOptions.find(o => o === 0) === 0,
            descriptorsEnabled: self.withOptions.find(o => o === 2) === 2,
          }
          //从视频流中检测人脸
          const detections = await self.$store.dispatch('face/getFaceDetections', { canvas: canvasDiv, options })
          const maskDetections = await self.$store.dispatch('face/getMaskDetections', { canvas: canvasDiv, options })
          // console.log(maskDetections);
          // console.log(detections);

          if (detections.length) {
            detections.forEach(async (detection) => {
              //添加人脸识别结果
              detection.recognition = await self.$store.dispatch('face/recognize', {
                descriptor: detection.descriptor,
                options
              }),
                //添加口罩识别项
                detection.maskdetect = await maskDetections
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
      } else {
        this.imgalert = true
      }
    },
  }
}
</script>
