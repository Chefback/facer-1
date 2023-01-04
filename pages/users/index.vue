<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-card-actions>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field v-model="name" :rules="nameRules" label="请输入名字" required />
            <v-spacer />
            <v-btn :disabled="!valid" @click="register()" color="primary">注册新用户</v-btn>
          </v-form>
        </v-card-actions>
        <v-dialog v-model="dialog" persistent max-width="320">
          <v-card>
            <v-card-title class="headline">警告！</v-card-title>
            <v-card-text>确定删除此用户吗？</v-card-text>
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
      <v-data-table :headers="headers" :items="desserts" :items-per-page="5" class="elevation-1"></v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      selectedUser: null,
      valid: true,
      name: null,
      nameRules: [
        v => !!v || 'Full name is required',
        v => (v && v.length > 1) || '请输入两个字以上的名字'
      ],
      headers: [
        {
          text: 'Dessert (100g serving)',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        { text: 'Calories', value: 'calories' },
        { text: 'Fat (g)', value: 'fat' },
        { text: 'Carbs (g)', value: 'carbs' },
        { text: 'Protein (g)', value: 'protein' },
        { text: 'Iron (%)', value: 'iron' },
      ],
      desserts: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: '1%',
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: '1%',
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: '7%',
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: '8%',
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: '16%',
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: '0%',
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: '2%',
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: '45%',
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: '22%',
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: '6%',
        },
      ],
    }
  },

  computed: {
    users() {
      return this.$store.state.user.list
    }
  },
  fetch({ store }) {
    return store.dispatch('user/getAll')
  },

  methods: {
    register() {
      const self = this
      if (this.$refs.form.validate()) {
        return this.$store.dispatch('user/register', this.name)
          .then(() => {
            return self.$router.push({ path: `/users/${self.name}` })
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
