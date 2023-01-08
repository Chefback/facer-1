
<template>
    <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
            <v-snackbar v-model="alert">
                {{ noinputalert?'请输入密码': '帐号或密码错误' }}
                <template v-slot:action="{ attrs }">
                    <v-btn color="red" text v-bind="attrs" @click="alert = false">
                        点击关闭
                    </v-btn>
                </template>
            </v-snackbar>
            <v-snackbar v-model="existalert">
                用户已存在
                <template v-slot:action="{ attrs }">
                    <v-btn color="red" text v-bind="attrs" @click="existalert = false">
                        点击关闭
                    </v-btn>
                </template>
            </v-snackbar>
            <v-snackbar v-model="inputvalid">
                请输入正确的帐号和密码
                <template v-slot:action="{ attrs }">
                    <v-btn color="red" text v-bind="attrs" @click="inputvalid = false">
                        点击关闭
                    </v-btn>
                </template>
            </v-snackbar>
            <v-card class="elevation-12">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>口罩识别系统管理员登陆</v-toolbar-title>
                </v-toolbar>
                <v-form ref="form" lazy-validation>
                    <v-text-field v-model="formLogin.username" :rules="nameRules" label="用户名" required></v-text-field>

                    <v-text-field v-model="formLogin.password" :rules="passRules" label="密码" required></v-text-field>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="success" class="mr-4" @click="handleRegister">注册</v-btn>
                        <v-btn color="success" class="mr-4" @click="handleLogin">登录</v-btn>
                        <v-btn color="error" class="mr-4" @click="reset">重置</v-btn>
                    </v-card-actions>

                </v-form>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
export default {
    layout: 'login',
    data() {
        return {
            alert: null,
            noinputalert: null,
            inputvalid: null,
            valid: true,
            existed: '用户已存在',
            existalert: null,
            admin: null,
            adminlist: [],
            nameRules: [
                v => (v && v.length > 2) || '请输入三个字以上的名字'
            ],
            passRules: [
                v => (v && v.length > 4) || '请输入5个字符以上的密码'
            ],
            formLogin: {
                username: '',
                password: '',
            },
        }
    },
    mounted() {
        this.loadAdmins()
    },

    methods: {
        loadAdmins() {
            let l = JSON.parse(localStorage.getItem('adminlist'))
            console.log('adminlist', l)
            this.adminlist = l ? l : []
        },
        handleRegister() {
            if (this.$refs.form.validate()) {
                if (this.userExists(this.formLogin.username)) {
                    this.existalert = true
                } else {
                    let newadmin = this.formLogin

                    console.log('new', newadmin)
                    this.$store.commit('user/addAdmin', newadmin)
                    this.reset()
                }
            } else {
                this.inputvalid = true
            }
        },
        userExists(username) {
            if (this.adminlist.length > 0) {
                return this.adminlist.some(function (el) {
                    return el.username === username;
                });
            }
        },
        handleLogin() {
            const user = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('input', JSON.stringify(this.formLogin))
            if (this.$refs.form.validate()) {
                if (user.username == this.formLogin.username && user.password == this.formLogin.password) {

                    console.log(this.formLogin)
                    this.$router.push({
                        path: `/`
                    })
                }
                else {
                    this.alert = true
                }
            } else {
                this.inputvalid = true
            }
        },
        reset() {
            this.$refs.form.reset()
        }
    },
}
</script>


<style scoped>

</style>