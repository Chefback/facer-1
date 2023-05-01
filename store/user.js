export const state = () => ({
  adminlist: [],
  userlist: [],
  fetched: false,
  count: 1
})

export const mutations = {
  setUsers(state, users) {
    //set server data
    state.userlist = users
    state.fetched = true
  },
  addUser(state, newuser) {
    state.userlist.push(newuser)
  },
  updateUser(state, update) {

  },
  removeUser(state, name) {
    for (let i = 0; i < state.userlist.length; i++) {
      if (state.userlist[i].name === name) {
        state.userlist.splice(i, 1)
      }
    }
  },

  addPhotos(state, data) {
    const found = state.userlist.find((item) => {
      return item.name === data.user
    })
    if (found) {
      data.photos.forEach((photo) => {
        found.photos.push(photo)
      })
    }
  },
  removePhoto(state, data) {
    const found = state.list.find((item) => {
      return item.name === data.user
    })
    if (found) {
      for (let i = 0; i < found.photos.length; i++) {
        const comps = found.photos[i].split('/')
        if (comps[comps.length - 1] === data.file) {
          found.photos.splice(i, 1)
        }
      }
    }
  }
}

export const actions = {
  async getAll({ commit }) {
    const data = await this.$axios.$get('/api/user/getAll')
    // const userlist = data.map((user) => {
    //   user.photos.forEach((x) => {
    //     console.log(x, 'x')
    //     return `http://127.0.0.1:3001/${user.name}/${x._id}`
    //   })
    //   return user
    // })
    console.log('serverdata', data)
    // console.log('data', userlist)
    commit('setUsers', data)
  },

  async create({ commit }, user) {
    await this.$axios.$post('/api/user/create', { user }).then(async () => {

      const data = await this.$axios.$get('/api/user/getAll')
      commit('setUsers', data)
    })
  },

  async update({ commit }, user) {
    await this.$axios.$post('/api/user/update', { user }).then(async () => {

      const data = await this.$axios.$get('/api/user/getAll')
      commit('setUsers', data)
    })

  },

  async delete({ commit }, user) {
    await this.$axios.$post('/api/user/delete', { user }).then(async () => {

      const data = await this.$axios.$get('/api/user/getAll')
      commit('setUsers', data)
    })

  },

  async upload({ commit }, photo) {
    const data = await this.$axios.$post('/api/user/upload', photo)
    commit('addPhotos', {
      user: photo.user,
      photos: photo.fileUpload
    })
  },

  async deletePhoto({ commit }, upload) {
    await this.$axios.$post('/api/user/deletePhoto', upload)
    // commit('removePhoto', upload)
  }
}

export const getters = {
  userByName: state => (name) => {
    let user = state.userlist.find(user => user.name === name)
    return user
  },

  isFetched: (state) => {
    return !!state.fetched
  }
}
