import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const routes = [{
    path: '/map',
    component: () => import('../page/Map')
},
{
    path: '*',
    redirect: '/map'
}]


export default new VueRouter({
    routes,
    mode: process.env.NODE_ENV === 'production'?'hash':'history',
    base: '/jj-vue-echarts/dist/'
})