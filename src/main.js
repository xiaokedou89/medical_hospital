import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import Router from 'vue-router'
import lodash from 'lodash'
import timeStampToTime from './store/global_fun'
import VueVideoPlayer from 'vue-video-player'
import VueLazyLoad from 'vue-lazyload'
import 'video.js/dist/video-js.css'

// 引入elementui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import { postKeyValueRequest } from './utils/api'
import { putKeyValueRequest } from './utils/api'
import { postRequest } from './utils/api'
import { getRequest } from './utils/api'
import { deleteRequest } from './utils/api'
import { putRequest } from './utils/api'
import { deleteKeyValueRequest } from './utils/api'
import { exportFileRequest } from './utils/api'


import { setCookie, getCookie, delCookie } from './assets/cookie'
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import uploader from 'vue-simple-uploader'
import jquery from "jquery"
import 'vue-happy-scroll/docs/happy-scroll.css'
// import  "./results/webuploader.html5only.min.js"
// import "./results/webuploader.css"
// import "./results/Uploader.swf"
import global from '@/utils/global'

Vue.prototype.postKeyValueRequest = postKeyValueRequest
Vue.prototype.putKeyValueRequest = putKeyValueRequest
Vue.prototype.postRequest = postRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.deleteKeyValueRequest = deleteKeyValueRequest;
Vue.prototype.exportFileRequest = exportFileRequest;
Vue.prototype.lodash = lodash;
Vue.prototype.$cookieStore = { setCookie, getCookie, delCookie }
// Vue.prototype.WebUploader=WebUploader

Vue.config.productionTip = false
Vue.prototype.$global=global;
Vue.use(uploader)
Vue.use(timeStampToTime);
Vue.use(VueVideoPlayer);
Vue.use(VueLazyLoad);
Vue.use(preview)

// 全局导航守卫
router.beforeEach((to, from, next) => {
	// 从缓存取token
	let token = JSON.parse(sessionStorage.getItem('token')) ? JSON.parse(sessionStorage.getItem('token')) : localStorage.getItem('token');
	if(!store.state.token.access_token){
		store.commit(`storeToken`,token);
	}
	if(store.state.username==""){
		let username = JSON.parse(sessionStorage.getItem(`username`))
		store.commit(`storeUsername`,username);
	}

	let medicalUploadFlag = to.path == '/medicalupload' && to.query.orderId != null && to.query.orderId != 'undefined' && to.query.orderId != undefined && to.query.workId != null && to.query.workId != undefined && to.query.workId != 'undefined'
	if (to.path == '/' || to.path.startsWith('/404') || (to.path=='/upload'&& to.query.id!=null && to.query.id!="undefined") || medicalUploadFlag) {
		next()
	} else {
		// todo:'这里先将accessToken的判断去掉'
		if (store.state.token.access_token || token ) {
			next();
		} else {
			console.log("404")
			next("/404");
		}
	}
})

//
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
	return routerPush.call(this, location).catch(error => error)
}

new Vue({
	router,
	jquery,
	store,
	render: h => h(App),
}).$mount('#app')

