/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import Vue from 'vue'
import Vuex from 'vuex'
// import { Notification } from 'element-ui';
import {getRequest} from "../utils/api";

Vue.use(Vuex)

const store =new Vuex.Store({
    state:{
        // 用户登陆之后存储的用户姓名
        username:'',
        // 用户登陆之后存储的accesstoken以及expiretoken等信息
        token:{},
        basic:{
            username: `admin`,
            password: `123456`
        },
        hospitalName: ''
    },
    getters:{
        getToken: state=> state.token
    },
    mutations:{
        storeUsername(state,username){
            state.username=username;
            sessionStorage.setItem(`username`,JSON.stringify(username));
        },
        storeToken(state,token){
            if(token){
                state.token=token;
                sessionStorage.setItem(`token`,JSON.stringify(token));
                localStorage.setItem('token', token)
            }
        },
        removeUsername(state){
            if(state.username){
                state.username="";
            }
        },
        removeToken(state){
            if(state.token){
                state.token={};
            }
        },
        saveHospitalName(state, hospitalName){
            if(hospitalName == ''){
                state.hospitalName = hospitalName
            }
        }
    },
    actions:{
        connect(context){
            context.state.stomp = Stomp.over(new SockJS('/ws/eq'));
            context.state.stomp.connection({},success=>{
                context.state.stomp.subscribe('/user/queue/chat',msg=>{
                    let receiveMsg=JSON.parse(msg.body);
                    if(!context.state.currentSession||receiveMsg.form!=context.state.currentSession.username){
                        Notification.info({
                            title:'{'+receiveMsg.fromNickname+'}发来一条消息!!!',
                            message: receiveMsg.content.length>10?receiveMsg.content.substr(0,10):receiveMsg.content,
                            position:'bottom-right'
                        })
                        Vue.set(context.state.isDot,context.state.currentHr.username+"#"+receiveMsg.from,true);
                    }
                    receiveMsg.notSelf=true;
                    receiveMsg.to=receiveMsg.from;
                    context.commit('addMessage',receiveMsg);
                })
            // eslint-disable-next-line no-unused-vars
            },error=>{
            })
        },
        initData(context){
            context.commit("INIT_DATA");
            getRequest("/chat/hrs").then(res=>{
                if(res){
                    context.commit("INIT_HR",res)
                }
            })
        },
        //获取一个初始化的基础路径用来展示图片
        getBaseUrl(context){
            getRequest(`/app/baseUrl`).then(res=>{
                context.commit('initBaseUrl',res.data);
            })
        },
        //获取服务器信息
        getServerInfo(context){
            getRequest(`/app/server/info`).then(res=>{
                context.commit('setServerInfo',res.data);
            })
        },
    }
})

store.watch(function(state){
    return state.sessions;
},function(val){
    localStorage.setItem("vue-chat-session",JSON.stringify(val));
},{
    deep:true
})


export default store;
