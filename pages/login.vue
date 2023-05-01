<template>
    <v-container class="text-center">
        <v-row :align="'center'" :justify="'center'" class="mt-12">
            <v-col cols="12" md="6" lg="3">
                <authenticate-form button-title="Loggin" :form.sync="form"> </authenticate-form>
            </v-col>
        </v-row>
        <snack-bar :snackbar-message.sync="snackbarMessage"></snack-bar>
    </v-container>
</template>
<script>
import AuthenticateForm from "@/components/authenticateForm.vue";
import SnackBar from '@/components/snackBar'
export default {
    layout: 'login',
    components: { AuthenticateForm, SnackBar },
    data() {
        return {
            form: {
                valid: false,
                name: '',
                password: '',
                finish: false
            },
            snackbarMessage: '404 not found',
        }
    },
    computed: {
        finish() {
            return this.form.finish
        }
    },
    watch: {
        finish(newVal) {
            if (newVal) {
                this.login()
                this.form.finish = false
            }
        }
    },
    methods: {
        async login() {
            await this.$auth.loginWith('local', {
                data: {
                    name: this.form.name,
                    password: this.form.password
                }
            }).then((res) => {

                console.log(res.data.message)

                // this.snackbar = true
                // this.snackbarMessage = res.data.message
            }).catch((error) => {
                console.log(error)
                this.snackbar = true
                this.snackbarMessage = error.response.data.message
            })
        }
    }
}
</script>