<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-dialog v-model="dialog" persistent max-width="320">
          <v-card>
            <v-card-title class="headline">警告！</v-card-title>
            <v-card-text>确定删除用户{{ selectedUser }}吗？</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="hideDialog()" color="green darken-1" flat>取消</v-btn>
              <v-btn @click="deleteUpload()" color="green darken-1" flat>确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-list two-line subheader>
        <v-list-item v-for="user in users" :key="user.name">
          <v-list-item-avatar>
            <v-avatar slot="activator" size="32px">
              <img v-if="user.photos.length" :src="user.photos[0]" alt="Avatar">
              <v-icon v-else color="primary">
                person
              </v-icon>
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-subtitle>
              {{ user.name }}
              <v-divider />
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn :to="'/users/' + user.name" color="primary" fab small>
              <v-icon>
                add_a_photo
              </v-icon>
            </v-btn>
            <v-divider />
          </v-list-item-action>
          <v-list-item-action>
            <v-btn @click="showDialog(user.name)" color="primary" fab small>
              <v-icon>
                close
              </v-icon>
            </v-btn>
            <v-divider />
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-flex>
    <v-flex>
      <v-data-table :headers="headers" :items="users" sort-by="calories" class="elevation-1">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>人脸信息管理</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="newdialog" max-width="500px">

              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">添加新用户</v-btn>
              </template>
              <v-form ref="newuser" v-model="valid" lazy-validation>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="user.id" label="用户ID"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="user.name" label="用户名"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="user.phone" label="电话号码"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-select v-model="user.sex" :items="sex" label=" 性别" solo></v-select>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="register">保存</v-btn>
                    <v-btn color="blue darken-1" text @click="close">取消</v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">警告！</v-card-title>
                <v-card-text>确定删除用户{{ selectedUser }}吗？</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn @click="closeDelete()" color="green darken-1" flat>取消</v-btn>
                  <v-btn @click="deleteItemConfirm()" color="green darken-1" flat>确定</v-btn>
                </v-card-actions>
                <!-- <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm">确认</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions> -->
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deleteItem(item)">
            mdi-delete
          </v-icon>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize">
            Reset
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
      dialog: false,
      dialogDelete: false,
      selectedUser: null,
      valid: true,
      name: null,
      user: {
        id: null,
        name: null,
        phone: null,
        sex: null, photos: null
      },
      userlist: [],
      nameRules: [
        v => !!v || 'Full name is required',
        v => (v && v.length > 1) || '请输入两个字以上的名字'
      ],
      sex: ['男', '女', '未知'],
      headers: [
        {
          text: '用户ID',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        { text: '用户名', value: 'calories' },
        { text: '用户性别', value: 'fat' },
        { text: '用户电话号码', value: 'carbs' },
        { text: '人脸信息录入', value: 'protein' },
        { text: '创建时间', value: 'iron' },
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
      console.log(this.$store.state.user.list)
      return this.$store.state.user.list
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
    editItem(item) {
      this.editedIndex = this.userlist.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.newdialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.userlist.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      // this.dialog = true
      this.selectedUser = item.name
    },
    deleteItemConfirm() {
      this.userlist.splice(this.editedIndex, 1)
      this.closeDelete()
    },
    close() {
      this.newdialog = false
      this.$refs.newuser.reset()
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
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.userlist[this.editedIndex], this.editedItem)
      } else {
        this.userlist.push(this.editedItem)
      }

      const self = this
      if (this.$refs.newuser.validate()) {
        console.log('yes')
        return this.$store.dispatch('user/register', this.user.name)
          .then(() => {
            return self.$router.push({ path: `/users/${self.user.name}` })
          })
      }
      this.close()
    },
    register() {
      const self = this
      if (this.$refs.newuser.validate()) {
        console.log('yes')
        return this.$store.dispatch('user/register', this.user.name)
          .then(() => {
            return self.$router.push({ path: `/users/${self.user.name}` })
          })
      }
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
