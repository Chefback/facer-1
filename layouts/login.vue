<template>
    <!-- <v-main>
        <v-container fluid>
            <div class="back">
            </div>

        </v-container>
    </v-main> -->
    <div class="container">
        <div class="logo">
            <img alt="logo"
                src="//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/dfdba5317c0c20ce20e64fac803d52bc.svg~tplv-49unhts6dw-image.image" />
            <div class="logo-text">Arco Design Pro</div>
        </div>
        <div class="content">
            <nuxt />
        </div>
    </div>
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

.footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
}

.logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 1;
    display: inline-flex;
    align-items: center;

}

.logo-text {
    margin-right: 4px;
    margin-left: 4px;
    color: var(--color-fill-1);
    font-size: 20px;
}
</style>