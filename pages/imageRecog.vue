<template>
  <v-layout row align-center justify-center wrap>
    <v-flex>
      <h1>上传图片检测</h1>
    </v-flex>
    <v-flex>
      <v-card flat>
        <form method="POST" class="form-documents" enctype="multipart/form-data">
          上传图片
          <input id="fileUpload" @change="filesChange($event.target.name, $event.target.files)" type="file"
            name="fileUpload">
        </form>
      </v-card>
      <v-btn @click="start()" fab small color="primary" dark>检测</v-btn>
    </v-flex>
    <v-flex xs12 md6>
      <img :id="user.name + index" :src="faceImg" width="320" height="247">
    </v-flex>
    <v-flex xs12 md6>
      <canvas id="live-canvas" width="320" height="247" />
    </v-flex>
    <v-flex v-for="(photo, index) in user.photos" :key="photo" xs12 md6 lg4>
      <v-card flat tile class="d-flex">
        <v-btn @click="showDialog(photo)" fab small color="primary" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <img :id="user.name + index" :src="photo">
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  computed: {
    faceImg() {
      return this.$store.state.faceimg
    },
  },

  watch: {
  },


  async beforeMount() {
    const self = this
    await self.$store.dispatch('face/getAll')
      .then(() => self.$store.dispatch('face/getFaceMatcher'))

  },

  async mounted() {
    // await this.recognize()
  },

  beforeDestroy() {
  },

  methods: {
    //每上传一张图片就上传到服务器
    filesChange(fieldName, fileList) {
      const self = this
      const formData = new FormData()
      formData.append('user', self.user.name)
      //Array(x)创建长度为x的空数组,keys()根据数组索引生成迭代器
      // from()浅拷贝一个数组
      //map()将数组根据函数返回结果生成新数组
      Array.from(Array(fileList.length).keys()).map((x) => {
        console.log(fieldName)
        //将input里的file列表中的file对象按文件，文件名逐个加入到formdata
        formData.append(fieldName, fileList[x], fileList[x].name)
      })
      //上传文件到服务器，后清空上传框
      return self.$store.dispatch('user/upload', formData)
        .then((result) => {
          if (document) {
            document.getElementById('fileUpload').value = ''
          }
        })
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
          detectionsEnabled: self.withOptions.find(o => o === 0) === 0,
          descriptorsEnabled: self.withOptions.find(o => o === 2) === 2,
        }
        //从视频流中检测人脸
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
    },
  }
}
</script>
