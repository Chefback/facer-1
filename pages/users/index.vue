<template>
  <v-layout row wrap>
    <v-flex>
      <v-data-table :headers="headers" :items="users" sort-by="id" hide-default-footer class="elevation-1">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>人脸信息管理</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn color="primary" dark class="mb-2" @click="train">训练模型</v-btn>
            <v-snackbar v-model="trainalert">
              {{ failalert ? '训练失败' : '训练成功' }}
              <template v-slot:action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" @click="trainalert = false">
                  点击关闭
                </v-btn>
              </template>
            </v-snackbar>
            <v-spacer></v-spacer>
            <v-dialog v-model="newdialog" max-width="500px">

              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">添加新用户</v-btn>
              </template>

              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <!-- <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="user.id" :rules="nameRules" label="用户ID"></v-text-field>
                      </v-col> -->
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="user.name" :rules="nameRules" label="用户名"></v-text-field>
                      </v-col>
                      <!-- <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="user.phone" label="电话号码"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-select v-model="user.sex" :items="sex" label=" 性别" solo></v-select>
                      </v-col> -->
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="register">保存</v-btn>
                  <v-btn color="blue darken-1" text @click="close">取消</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">警告！</v-card-title>
                <v-card-text>确定删除用户{{ selectedUser }}吗？</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn @click="closeDelete()" color="green darken-1" text>取消</v-btn>
                  <v-btn @click="deleteItemConfirm()" color="green darken-1" text>确定</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.photos="{ item }">
          <div v-for="(photo, index) in item.photos" :key="index">
            <img :src="photo" style="width: 50px; height: 50px" />
          </div>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn :to="'/users/' + item.name">
            <v-icon class="mr-2">
              mdi-pencil
            </v-icon>
          </v-btn>
          <v-btn @click="deleteItem(item)">
            <v-icon small>
              mdi-delete
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      newdialog: false,
      dialog: false,
      dialogDelete: false,
      selectedUser: null,
      //警告
      trainalert: null,
      failalert: null,
      user: {
        // id: '',
        name: '',
        // phone: null,
        // sex: '',
        // photos: [],
        // createdAt: null
      },
      nameRules: [
        v => !!v || 'Full name is required',
        v => (v && v.length > 1) || '请输入两个字以上的名字'
      ],
      sex: ['男', '女', '未知'],
      headers: [
        // {
        //   text: '用户ID',
        //   align: 'start',
        //   value: 'id',
        // },
        { text: '用户名', value: 'name' },
        // { text: '用户性别', value: 'sex' },
        // { text: '用户电话号码', value: 'phone' },
        // // { text: '人脸信息录入', value: 'photos' },
        // { text: '创建时间', value: 'createdAt' },
        { text: 'Actions', value: 'actions', sortable: false },

      ],
      desserts: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
      },
      defaultItem: {
        name: '',
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
      },
    }
  },

  computed: {
    users() {
      let arr1 = this.$store.state.user.list
      let arr2 = this.$store.state.user.userlist
      let merged = []
      for (let i = 0; i < arr1.length; i++) {
        merged.push({
          ...arr1[i],
          ...arr2[i]
        });
      }

      console.log('merged', merged)


      console.log('photolist', arr1)
      console.log('userlist', arr2)
      return merged
    },
    formTitle() {
      return this.editedIndex === -1 ? '新用户' : '修改用户'
    },
  },
  watch: {
    newdialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  fetch({ store }) {
    return store.dispatch('user/getAll')
  },

  methods: {
    async train() {
      const self = this
      const faces = []
      await Promise.all(self.users.map(async (user) => {
        const descriptors = []
        console.log(user)
        await Promise.all(user.photos.map(async (photo) => {
          const img = new Image()
          img.src = photo
          console.log(img)
          const options = {
            detectionsEnabled: true,
            descriptorsEnabled: true,
          }
          //检测注册用户的人脸数据
          const detections = await self.$store.dispatch('face/getFaceDetections', { canvas: img, options })
          detections.forEach((d) => {
            descriptors.push({
              path: photo,
              descriptor: d.descriptor
            })
          })
        }))
        faces.push({
          user: user.name,
          descriptors
        })
      }))
      await self.$store.dispatch('face/save', faces)
        .then(() => {
          self.trainalert = true
          self.failalert = null
        })
        .catch((e) => {
          self.trainalert = true
          self.failalert = true
          console.error(e)
        })
    },
    editItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.newdialog = true
    },
    deleteItem(item) {
      console.log(item)
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      // this.dialog = true
      this.selectedUser = item.name
    },
    deleteItemConfirm() {
      this.deleteUpload()
      // this.users.splice(this.editedIndex, 1)
      this.closeDelete()
    },
    close() {
      this.newdialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    register() {
      const self = this

      const now = Date.now()
      this.user.createdAt = new Date(now).toUTCString()

      return this.$store.dispatch('user/register', this.user.name)
        .then(() => {

          console.log('userlist', self.user)
          // localStorage.setItem('userlist',
          //   JSON.stringify(self.$store.state.user.userlist))
          self.$store.commit('user/setDetail', self.user)
          self.close()
          return self.$router.push({ path: `/users/${self.user.name}` })
        })
    },

    showDialog(name) {
      this.dialog = true
      this.selectedUser = name
    },

    hideDialog() {
      this.dialog = false
      this.selectedUser = null
    },

    async deleteUpload() {
      if (this.selectedUser) {
        await this.$store.dispatch('user/delete', this.selectedUser)
        this.selectedUser = null
        this.dialog = false
      }
    }
  }
}
</script>
