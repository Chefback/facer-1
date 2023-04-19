
<template>
    <v-container class="text-center">
        <v-row :align="'center'" :justify="'center'" class="mt-12">
            <v-col cols="12" md="6" lg="3">
                <authenticate-form button-title="Register" :form.sync="form"></authenticate-form>
            </v-col>
        </v-row>
        <snack-bar :snackbar-message.sync="snackbarMessage"></snack-bar>
    </v-container>
</template>
<script>
import AuthenticateForm from '@/components/authenticateForm.vue'
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
            snackbarMessage: 'ladh'
        }
    },
    computed: {
        finish() {
            return this.form.finish
        }
    },
    watch: {
        finish(newval) {
            if (newval) {
                this.register()
                this.form.finish = false
            }
        }
    },
    methods: {
        async register() {
            try {
                const admin = {
                    name: this.form.name,
                    password: this.form.password
                };
                const response = await this.$axios.post('/api/auth/register', admin)

                await this.$auth.loginWith('local', {
                    data: admin
                })

                this.snackbar = true
                this.snackbarMessage = response.data.message
                await this.$router.push('/')

            } catch (error) {
                this.snackbar = true
                this.snackbarMessage = error.response.data.message
            }

        }
    }
}
</script>