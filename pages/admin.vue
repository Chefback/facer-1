<template>
  <v-layout row wrap>
    <v-flex>
      <v-data-table :headers="headers" :items="admins" sort-by="calories" hide-default-footer class="elevation-1">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>管理员页面</v-toolbar-title>
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
                          <v-text-field v-model="admin.id" label="管理员ID"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="admin.name" label="管理员用户名"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="admin.password" label="密码"></v-text-field>
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
        <!-- <template v-slot:no-data>
          <v-btn color="primary">
            Reset
          </v-btn>
        </template> -->
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
      valid: true,
      name: null,
      admin: {
        id: null,
        name: null,
        password: null,
        createdAt: null
      },
      userlist: [],
      nameRules: [
        v => !!v || 'Full name is required',
        v => (v && v.length > 1) || '请输入两个字以上的名字'
      ],
      sex: ['男', '女', '未知'],
      headers: [
        {
          text: '管理员ID',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: '管理员用户名', value: 'name' },
        { text: '密码', value: 'password' },
        { text: '创建时间', value: 'createdAt' },
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
    admins() {
      console.log(this.$store.state.user.adminlist)
      return this.$store.state.user.adminlist
    },
    formTitle() {
      return this.editedIndex === -1 ? '新管理员' : '修改信息'
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
    register() {
      const self = this
      if (this.$refs.newuser.validate()) {
        this.user.createdAt = Date.now()

        console.log('yes')
        return this.$store.commit('user/setAdmins', this.admin)
          .then(() => {
            // localStorage.setItem('userlist',
            //   JSON.stringify(self.$store.state.list))
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

  }
}
</script>
