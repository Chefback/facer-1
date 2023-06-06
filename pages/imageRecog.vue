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
        上传图片
        <input id="fileUpload" @change="filesChange($event)" type="file" name="fileUpload">
      </v-card>
      <v-btn @click="startTest()" class="mb-2" color="primary" dark>检测</v-btn>
      <v-btn @click="clear" class="mb-2" color="primary" dark>
        清除</v-btn>
    </v-flex>
    <v-flex xs12 md6>
      <img id="upload-img" :src="faceImg" width="320" height="247">
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
      faceImg: null,
      imgalert: null
    }
  },
  async beforeMount() {
    const self = this
    await self.$store.dispatch('face/getAll')
      .then(() => {
        self.$store.dispatch('face/getFaceMatcher')
      })

  },

  beforeDestroy() {
    this.clear()
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
      if (self.interval) {
        clearInterval(self.interval)
      }
      const file = document.getElementById('fileUpload')
      const canvasDiv = document.getElementById('live-canvas')
      const canvasCtx = canvasDiv.getContext('2d')
      canvasCtx.clearRect(0, 0, 320, 247)
      this.faceImg = null
      file.value = ''

    },
    async startTest(canvas) {
      const self = this;

      const imgDiv = document.getElementById('upload-img')
      const canvasDiv = document.getElementById('live-canvas')
      const canvasCtx = canvasDiv.getContext('2d')
      self.start(imgDiv, canvasDiv, canvasCtx)
    },
    start(videoDiv, canvasDiv, canvasCtx) {
      if (this.faceImg) {
        const self = this
        if (self.interval) {
          clearInterval(self.interval)
        }
        self.interval = setInterval(async () => {
          //将video组件绘制到canva上
          canvasCtx.drawImage(videoDiv, 0, 0, 320, 247)
          const options = {
            detectionsEnabled: true,
            descriptorsEnabled: true,
          }
          //从视频流中检测人脸
          const detections = await self.$store.dispatch('face/getFaceDetections', { canvas: canvasDiv, options })
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
                detection.maskdetect = await self.$store.dispatch('face/getMaskClassify', { canvas: canvasDiv });

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

          console.log(detections, '检测结果')
        }, 1000)
      } else {
        this.imgalert = true
      }
    },
  }
}
</script>
