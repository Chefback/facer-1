<template>
  <v-layout row wrap>
    <v-flex xs6>
      <v-progress-circular v-if="isProgressActive" :rotate="360" :size="100" :width="15" :value="progress" color="teal">
        Training...
      </v-progress-circular>
    </v-flex>
    <v-flex>

      <v-tabs v-model="tab" centered color="green-lighten2" icons-and-text>
        <v-tabs-slider color="yellow" />

        <v-tab href="#tab-1">上传图片</v-tab>


        <v-tab-item value="tab-1">
          <v-card flat>
            <form method="POST" class="form-documents" enctype="multipart/form-data">
              上传图片
              <input id="fileUpload" :multiple="multiple" @change="filesChange($event.target.name, $event.target.files)"
                type="file" name="fileUpload">
            </form>
          </v-card>
        </v-tab-item>
        <v-flex xs6>
          <v-btn @click="train()" color="primary">
            Train
          </v-btn>
        </v-flex>
      </v-tabs>
    </v-flex>
    <v-flex v-for="user in users" :key="user.name" xs12>
      <v-card>
        <v-card-title>
          <strong class="headline">{{ user.name }}</strong>
          <v-btn :to="{ path: `/users/${user.name}` }" fab dark small color="primary">
            <v-icon dark>
              add_a_photo
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-layout row wrap>
          <v-flex v-for="(photo, index) in user.photos" :key="photo" xs12 md6 lg4>
            <v-card flat tile class="d-flex">
              <img :id="user.name + index" :src="photo">
            </v-card>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>

export default {
  data() {
    return {
      step: 1,
      counter: 0,
      progress: 0,
      isProgressActive: false
    }
  },
  computed: {
    users() {
      return this.$store.state.user.list
    }
  },

  async fetch({ store }) {
    const self = this
    await store.dispatch('user/getAll')
      .then((users) => {
        self.step += users.length
      })
  },

  methods: {
    async train() {
      await this.$store.dispatch('face/train')
    },
    increaseProgress() {
      const self = this
      self.progress = (100 / self.step) * ++self.counter
    },
    resetProgress() {
      const self = this
      self.progress = self.counter = 0
      self.isProgressActive = true
    }
  }
}
</script>
