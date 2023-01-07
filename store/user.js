
export const state = () => ({
  list: [],
  fetched: false
})

export const mutations = {
  setUsers(state, users) {
    let photo2map = users.reduce((acc, curr) => {
      acc[curr.name] = curr
      return acc;
    }, {});
    let combined = state.list.map(d => Object.assign(d, photo2map[d.name]));
    state.list = combined
    state.fetched = true
  },
  addUser(state, user) {
    state.list.push(user)
  },
  removeUser(state, name) {
    for (let i = 0; i < state.list.length; i++) {
      if (state.list[i].name === name) {
        state.list.splice(i, 1)
      }
    }
  },

  addPhotos(state, data) {
    const found = state.list.find((item) => {
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
    commit('setUsers', data)
    return data
  },
  async register({ commit }, user) {
    await this.$axios.$post('/api/user/register', { user })
    commit('addUser', user)
  },
  async delete({ commit }, name) {
    await this.$axios.$post('/api/user/delete', { name })
    commit('removeUser', name)
  },
  async upload({ commit }, upload) {
    const data = await this.$axios.$post('/api/user/upload', upload)
    commit('addPhotos', {
      user: upload.get('user'),
      photos: data
    })
  },
  async uploadBase64({ commit }, upload) {
    const data = await this.$axios.$post('/api/user/uploadBase64', { upload })
    commit('addPhotos', {
      user: upload.user,
      photos: data
    })
  },
  async deletePhoto({ commit }, upload) {
    await this.$axios.$post('/api/user/deletePhoto', { upload })
    commit('removePhoto', upload)
  }
}

export const getters = {
  userByName: state => (name) => {
    return state.list.find(user => user.name === name)
  },
  isFetched: (state) => {
    return !!state.fetched
  }
}
