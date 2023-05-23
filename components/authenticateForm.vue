
<template>
    <v-form ref="form" v-model="form.valid" lazy-validation>
        <v-text-field v-model="form.name" :rules="nameRules" label="Name" required></v-text-field>

        <v-text-field v-model="form.password" :counter="20" :rules="passwordRules" :type="'password'" label="Password"
            required></v-text-field>

        <div class="d-flex justify-space-between">

            <v-btn :disabled="!form.valid" color="indigo lighten-1" class="mr-4" @click="validate">
                {{ buttonTitle }}
            </v-btn>
            <v-btn color="indigo lighten-1" class="mr-4" @click="loginorregis">
                {{ anobuttonTitle }}
            </v-btn>
        </div>
    </v-form>
</template>

<script>
export default {
    name: 'authenticationForm',
    data: () => ({
        nameRules: [
            v => !!v || 'Name is required',
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
    computed: {
        anobuttonTitle() {
            return this.buttonTitle == 'Loggin' ? 'Register' : 'Loggin'
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
        },
        async loginorregis() {
            const path = this.anobuttonTitle == 'Register' ? '/signup' : '/login'
            await this.$router.push(path)
        }
    }
}
</script>