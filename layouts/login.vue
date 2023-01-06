<template>
    <v-main>
        <v-container fluid>
            <div class="back">
                <nuxt />
            </div>
        </v-container>
    </v-main>
</template>
<script>

export default {
    data() {
        return {
        }
    },
    computed: {
    },
    async mounted() {
        const user = { username: 'admin', password: 12345 }
        localStorage.setItem('user', JSON.stringify(user));
    }
}
</script>
<style scoped>
.back {
    background-image: url("../assets/mask.jpg");

    padding: 20px;
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin-bottom: 20px;
    /* background-color: #385ba1; */
    margin: 180px auto;
    /* border: 2px solid #8492A6;*/
}
</style>