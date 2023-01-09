
export const state = () => ({
  list: [],
  adminlist: [],
  userlist: [],
  combinedlist: [],
  fetched: false,
  count: 1
})

export const mutations = {
  // loadCombined(state) {
  //   let user = state.list
  //   let userlist = state.userlist
  //   let photo2map = user.reduce((acc, curr) => {
  //     acc[curr.name] = curr
  //     return acc;
  //   }, {});
  //   let combined = user && userlist ? userlist.map(d => Object.assign(d, photo2map[d.name])) : [];
  //   state.combinedlist = combined
  // },
  setUsers(state, users) {
    //set server data
    state.list = users
    state.fetched = true
  },
  setDetail(state, users) {
    //set server data
    state.userlist.push(users)
    console.log('userdetail', users)
    console.log('stateuserlist', state.userlist)
  },
  addUser(state, name) {
    state.list.push({
      name,
      photos: []
    })
  },

  setAdmins(state, users) {

    state.adminlist = users ? Array.from(users) : []
  },
  addAdmin(state, user) {
    state.adminlist.push(user)
    console.log(state.adminlist)
  },
  removeAdmin(state, name) {
    for (let i = 0; i < state.adminlist.length; i++) {
      if (state.adminlist[i].name === name) {
        state.adminlist.splice(i, 1)
      }
    }
  },
  clearaddUserList(state, user) {
    state.userlist = user ? Array.from(user) : []
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
    console.log('serverdata', data)
    commit('setUsers', data)
    return data
  },
  async register({ commit }, name) {
    await this.$axios.$post('/api/user/register', { name })
    commit('addUser', name)
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
    let user2 = state.userlist.find(user => user.name === name)
    return state.list.find(user => user.name === name)
  },
  isFetched: (state) => {
    return !!state.fetched
  }
}
