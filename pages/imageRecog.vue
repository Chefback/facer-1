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
      interval: null,
      isProgressActive: true,
      recognition: '',
    }
  },
  computed: {
    models() {
      return this.$store.state.model.list
    }
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
  }
}
</script>
