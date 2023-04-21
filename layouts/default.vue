<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" permanent fixed app>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router>
          <v-list-item-action>
            <v-icon v-html="item.icon" />
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-btn @click.stop="miniVariant = !miniVariant" icon>
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'" />
      </v-btn>
      <v-toolbar-title v-html="title" />
      <!-- <v-flex>
        <v-btn @click="logout">登出</v-btn>
      </v-flex> -->
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
export default {
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        { icon: 'home', title: '欢迎', to: '/' },
        // { icon: 'manage_accounts', title: '管理页面', to: '/admin' },
        { icon: 'people', title: '人脸数据库', to: '/users' },
        { icon: 'wallpaper', title: '本地图片检测', to: '/imageRecog' },
        { icon: 'camera', title: '摄像头检测', to: '/camRecog' }
      ],
      miniVariant: true,
      right: true,
      rightDrawer: false,
      title: '口罩检测与人脸识别系统'
    }
  },
  computed: {
    loading() {
      return this.$store.state.face.loading
    }
  },
  created() {
  },
  async mounted() {
    const self = this

    // await self.$store.commit('user/loadCombined')

    await self.$store.dispatch('face/load')
    console.log(tf.getBackend())
  },
  methods: {
    logout() {
      this.$router.push({ path: `/login` })
    },
  }
}
</script>
