<template>
  <v-layout row wrap>
    <v-flex>
      <v-data-table :headers="headers" :items="users" sort-by="id" hide-default-footer class="elevation-1">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>人脸信息管理</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn color="primary" dark class="mb-2" @click="train">训练模型</v-btn>
            <!-- <v-snackbar v-model="trainalert">
              {{ failalert ? '训练失败' : '训练成功' }}
              <template v-slot:action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" @click="trainalert = false">
                  点击关闭
                </v-btn>
              </template>
            </v-snackbar>  -->
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
                  <v-btn color="blue darken-1" text @click="create">保存</v-btn>
                  <v-btn color="blue darken-1" text @click="closeDialog(1)">取消</v-btn>
                  <!-- fixme error clicking cancel
                    peError: Cannot read properties of null (reading 'name') -->

                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">警告！</v-card-title>
                <v-card-text>确定删除用户{{ selectedUserName }}吗？</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn @click="deleteItemConfirm()" color="green darken-1" text>确定</v-btn>
                  <v-btn @click="closeDialog(2)" color="green darken-1" text>取消</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="showDialog(2, item)">
            mdi-pencil
          </v-icon>
          <v-icon small class="mr-2" @click="showDialog(3, item)">
            mdi-delete
          </v-icon>
          <v-btn :to="'/users/' + item.name">
            图片<v-icon small>
              mdi-menu-right
            </v-icon>
          </v-btn>
          <!-- todo show img -->
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
      dialogDelete: false,
      selectedUser: '',
      selectedUserName: '',
      editedIndex: -1,
      emptyuser: {
        name: '',
        phone: '',
        sex: '',
      },
      nameRules: [
        v => !!v || 'Full name is required',
        v => (v && v.length > 1) || '请输入两个字以上的名字'
      ],
      sex: ['男', '女', '未知'],
      headers: [
        { text: '用户ID', align: 'start', value: '_id' },
        { text: '用户名', value: 'name' },
        { text: '用户性别', value: 'sex' },
        { text: '用户电话号码', value: 'phone' },
        // { text: '人脸信息录入', value: 'photos' },
        // { text: '创建时间', value: 'createdAt' },
        { text: '操作', value: 'actions', sortable: false },

      ],
    }
  },

  computed: {
    users() {
      return this.$store.state.user.userlist
    },
    formTitle() {
      return this.editedIndex === -1 ? '新用户' : '修改用户'
    },
    user() {
      return this.editedIndex === -1 ? this.emptyuser : this.selectedUser
    }
  },
  watch: {
    newdialog(val) {
      val || this.closeDialog(1)
    },
    dialogDelete(val) {
      val || this.closeDialog(2)
    },
  },
  fetch({ store }) {
    return store.dispatch('user/getAll')
  },

  methods: {
    deleteItemConfirm() {
      const item = this.selectedUser
      this.$store.dispatch('user/delete', item.name)
      this.dialogDelete = false
    },
    //fixme no changes in the front after deletion
    //promise) TypeError: Cannot read properties of undefined (reading 'length')

    create() {
      const self = this
      if (this.editedIndex == -1) {
        return this.$store.dispatch('user/create', this.user)
          .then(() => {
            self.closeDialog(1)
            return self.$router.push({ path: `/users/${self.user.name}` })
          })
      } else {

        return this.$store.dispatch('user/update', this.user)
          .then(() => {
            self.closeDialog(1)
          })
      }
    },
    train() {
      this.$store.dispatch('face/train')
    },

    showDialog(options, item) {
      this.selectedUser = item
      this.selectedUserName = item.name
      switch (options) {
        //新用户
        case 1:
          this.newdialog = true
          break;
        //更新用户
        case 2:
          this.editedIndex = 0;
          this.newdialog = true
          break;
        //删除用户
        case 3:
          this.dialogDelete = true
          break;
      }
    },

    closeDialog(options) {
      switch (options) {
        //新用户
        //更新用户
        case 1:
          this.newdialog = false
          this.$nextTick(() => {
            this.editedIndex = -1
          })
          break;
        case 2:
          this.dialogDelete = false
          this.$nextTick(() => {
            this.editedIndex = -1
          })
          break;
        //删除用户
      }
      this.selectedUser = null
    },

  }
}
</script>
