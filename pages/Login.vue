
<template>
    <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
            <v-snackbar v-model="alert">
                帐号或密码错误
                <template v-slot:action="{ attrs }">
                    <v-btn color="red" text v-bind="attrs" @click="alert = false">
                        关闭
                    </v-btn>
                </template>
            </v-snackbar>
            <v-card class="elevation-12">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>口罩识别系统管理员登陆</v-toolbar-title>
                </v-toolbar>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-text-field v-model="formLogin.username" :counter="10" label="用户名" required></v-text-field>

                    <v-text-field v-model="formLogin.password" label="密码" required></v-text-field>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="!valid" color="success" class="mr-4" @click="handleSubmit">登录</v-btn>
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
            formLogin: {
                username: '',
                password: '',
            },
        }
    },
    methods: {
        handleSubmit(name) {

            const user = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('input', JSON.stringify(this.formLogin))
            if (user.username == this.formLogin.username && user.password == this.formLogin.password) {

                console.log(this.formLogin)
                this.$router.push({
                    path: `/`
                })
            } else {
                this.alert = true
            }
        },
        reset() {
            this.$refs.form.reset()
        }
    },
    mounted() {
    }
}
</script>


<style scoped>

</style>