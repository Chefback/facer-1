const pkg = require('./package')
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  PORT_API: process.env.PORT_API || 3001
}
env.API_URL = process.env.API_URL || `http://localhost:${env.PORT_API}`

const isDev = env.NODE_ENV === 'development'
const config = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [{
      charset: 'utf-8'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },
    {
      hid: 'description',
      name: 'description',
      content: pkg.description
    }
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
    }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#fff'
  },

  /*
   ** Global CSS
   */
  css: [],

  env,

  serverMiddleware: [
    '~/api/index.js'
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/vuetify',
    '@/plugins/userAuth',
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/vuetify',
    '@nuxtjs/auth'
  ],
  auth: {
    localStorage: true,
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/api/auth/login',
            method: 'post',
            propertyName: 'token'
          },
          logout: false,
          user: {
            url: '/api/auth/user',
            method: 'get',
            propertyName: false
          },
        },
      }
    },
    redirect: {
      logout: '/',
      callback: '/login',
      home: '/'
    },
  },
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: 'http://localhost:3001',
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */transpile: ["mongodb"],
    'babel': {
      "plugins": ['@babel/plugin-proposal-optional-chaining',
        "@babel/plugin-proposal-nullish-coalescing-operator"
      ],
    },

    extend(config, ctx) {
      if (!config.node) {
        config.node = {}
      }
      // Run ESLint on save
      config.node.fs = 'empty'
      if (ctx.isDev && ctx.isClient) {
        // config.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.(js|vue)$/,
        //   loader: 'eslint-loader',
        //   exclude: /(node_modules)/
        // })
      }
    }
  }
}
if (isDev) {
  config.axios.baseURL = `http://${env.HOST}:${env.PORT_API}`
} else {
  config.axios.baseURL = env.API_URL
}

module.exports = config
