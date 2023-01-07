<template>
  <v-layout row wrap align-center>
    <v-flex xs12>
      <h1>图片: {{ user.name }}</h1>
      <v-dialog v-model="dialog" persistent max-width="320">
        <v-card>
          <v-card-title class="headline">警告！</v-card-title>
          <v-card-text>是否确定删除此图片？</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="hideDialog()" color="green darken-1" flat>取消</v-btn>
            <v-btn @click="deleteUpload()" color="green darken-1" flat>确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
    <v-flex xs12>
      <v-tabs v-model="tab" centered color="green-lighten2" icons-and-text>
        <v-tabs-slider color="yellow" />

        <v-tab href="#tab-1">上传</v-tab>

        <v-tab href="#tab-2">拍照</v-tab>

        <v-tab-item value="tab-1">
          <v-card flat>
            <form method="POST" class="form-documents" enctype="multipart/form-data">
              上传图片
              <input id="fileUpload" :multiple="multiple" @change="filesChange($event.target.name, $event.target.files)"
                type="file" name="fileUpload">
            </form>
          </v-card>
        </v-tab-item>

        <v-tab-item value="tab-2">
          <v-card flat>
            <v-btn v-if="isCameraStarted" @click="takePhoto" color="secondary">
              拍照
            </v-btn>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <video id="live-video" v-if="isCameraStarted" width="320" height="247" autoplay />
              </v-flex>
              <v-flex xs12 md6>
                <canvas id="live-canvas" width="320" height="247" />
              </v-flex>
            </v-layout>
          </v-card>
        </v-tab-item>

      </v-tabs>
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
      dialog: false,
      fab: true,
      tab: 'tab-1',
      multiple: true,
      selectedPhoto: null
    }
  },
  computed: {
    user() {
      const userByName = this.$store.getters['user/userByName']
      return userByName(this.$route.params.name)
    },
    isCameraStarted() {
      return this.$store.getters['camera/isCameraStarted']
    }
  },
  watch: {
    async tab(val) {
      if (this.tab === 'tab-2') {
        await this.$store.dispatch('camera/startCamera')
          .then((stream) => {
            const videoDiv = document.getElementById('live-video')
            videoDiv.srcObject = stream
          })
      } else {
        await this.$store.dispatch('camera/stopCamera')
      }
    }
  },

  fetch({ store }) {
    if (!store.getters['user/isFetched']) {
      return store.dispatch('user/getAll')
    }
  },

  beforeDestroy() {
    this.$store.dispatch('camera/stopCamera')
  },
  methods: {
    showDialog(photo) {
      this.dialog = true
      this.selectedPhoto = photo
    },

    hideDialog() {
      this.dialog = false
      this.selectedPhoto = null
    },

    async deleteUpload() {
      //从选中的文件路径提取文件名并上传给服务器，服务器随即删除此文件。
      if (this.selectedPhoto) {
        const comps = this.selectedPhoto.split('/')
        await this.$store.dispatch('user/deletePhoto', {
          user: this.user.name,
          file: comps[comps.length - 1]
        })
        this.selectedPhoto = null
        this.dialog = false
      }
    },
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
    async takePhoto() {
      const video = document.getElementById('live-video')
      const canvas = document.getElementById('live-canvas')
      const canvasCtx = canvas.getContext('2d', { willReadFrequently: true })
      canvasCtx.drawImage(video, 0, 0, 320, 247)
      //将截取的视频帧绘制到canva上并转化为dataurl,上传给服务器
      const content = canvas.toDataURL('image/jpeg')
      await this.$store.dispatch('user/uploadBase64', {
        user: this.user.name,
        content
      })
    }
  }
}
</script>
