export default (context) => {
    if (process.client) {
        // const user = JSON.parse(localStorage.getItem('user'));
        const user = { username: 'admin', password: 12345 };
        const token = user.username == 'admin' && user.password == 12345
        context.app.router.beforeEach((to, from, next) => {
            if (!token && to.path !== '/login') {
                next('/login');
            } else if (to.path !== '/login') {
                next();
            } else {
                next();
            }
        })
    }
};