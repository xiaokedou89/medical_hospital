import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)



export default new Router({
    mode: 'history',
    routes:[
        {
            path: '/',
            name: 'Login',
            component: () => import('./views/Login.vue'),
            hidden: true
        },
        {
            path: '/home',
            name: 'Home',
            component: () => import('./views/Home.vue'),
            hidden: true
        }
        ,{
            path: '/upload',
            name: 'Upload',
            component: () => import('./views/Upload.vue'),
            hidden: true
        },
        {
            path: '/medicalupload',
            name: 'MedicalUpload',
            component: () => import('./views/MedicalUpload.vue'),
            hidden: true
        }
        ,{
            path: '/404',
            name: 'Error',
            component: () => import('@/views/error/index.vue'),
            hidden: true
        }
    ]
})