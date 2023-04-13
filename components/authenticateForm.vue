
<template>
    <v-form ref="form" v-model="form.valid" lazy-validation>
        <v-text-field v-model="form.email" :rules="emailRules" label="E-mail" required></v-text-field>

        <v-text-field v-model="form.password" :counter="20" :rules="passwordRules" :type="'password'" label="Password"
            required></v-text-field>
        <v-btn :disabled="!form.valid" color="indigo lighten-1" class="mr-4" @click="validate">
            {{ buttonTitle }}
        </v-btn>
    </v-form>
</template>

<script>
export default {
    name: 'authenticationForm',
    data: () => ({
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        passwordRules: [
            v => !!v || 'Password is required',
            v => (v.length <= 20) || 'Password must be less than 20 characters',
        ]
    }),
    props: {
        form: {
            required: true,
        },
        buttonTitle: {
            required: true
        }
    },
    mounted() {
        this.form.valid = false
    },
    methods: {
        validate() {
            if (this.$refs.form.validate()) {
                this.form.finish = true
                this.$emit('update:form', this.form)
            }
        }
    }
}
</script>