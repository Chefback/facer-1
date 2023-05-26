<template>
    <v-app>
        <v-main>
            <v-container class="fill-height">
                <v-layout align-center align-content-center>
                    <v-flex>
                        <v-container>
                            <v-row class="text-center fill-height" justify="center">
                                <v-col cols="8" align-self="center">
                                    <v-card class="fill-height" tile>
                                        <v-card-text>
                                            <div class="logo">
                                                <img alt="logo"
                                                    src="//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/dfdba5317c0c20ce20e64fac803d52bc.svg~tplv-49unhts6dw-image.image" />
                                                <div class="logo-text">口罩人脸识别系统</div>
                                            </div>
                                            <nuxt />
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-main>
    </v-app>
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
<style scoped >
/* .back {
    background-image: url("../assets/mask.jpg");

    padding: 20px;
    box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin-bottom: 20px;
    background-color: #385ba1;
    margin: 180px auto;
    border: 2px solid #8492A6;
} */
.container {
    display: flex;
}

.content {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-bottom: 40px;
}

.content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.login-card {
    max-width: 400px;
    width: 100%;
    padding: 24px;
}
</style>