import axios from 'axios'
import router from '../router'

import store from '../store'
import {Message} from 'element-ui';

let base = '/api'
let loginBase = '/login';
let authentication = `Authorization`;

let isRetry = false;
let invalid_token = "invalid_token"

let code = {
    normal: 20000,
    expire: 20003
}

let cloudAccessExCode = "22005";
let expireCode = "20006";
let authFailed = "20003"

const service = axios.create({
    timeout: 5000000,
    // onDownloadProgress(e) {
    //     console.log(e)
    // }
    // headers:'Content-Type':'multipart/form-data'
    // headers: [{
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     withCredentials: true,
    // }],
});

service.interceptors.response.use(success => {
    if (success.data.code == 20000) {
        return success.data
    }
    if (success.data.code == authFailed) {
        // dealExpireOnce(success)
        if(success.config.url.indexOf(`${loginBase}`)==-1){
            Message.warning("服务器繁忙,请重试")
        }
        return success.data
    }
    if (success.data.code == cloudAccessExCode) {
        Message.error({message: success.data.message == '' ? '当前百度网盘上传文件失败,请联系管理员' : success.data.message});
    }
    if (success.data.code == expireCode) {
        dealExpireOnce(success)
    }
    if (success.data.error == invalid_token) {
        dealExpireOnce(success)
        if(success.config.url.indexOf(`${loginBase}`)==-1){
            Message.warning("服务器繁忙,请重试")
        }
    }
    return success.data;
}, err => {
    console.log(err)
    // Message.error({message: error.data.message == '' ? '当前百度网盘上传文件失败,请联系管理员' : error.data.message});
    // console.log(error)
    Message.error("当前系统异常,请联系管理员")
})

async function dealExpireOnce(error) {
    if (!isRetry) {
        isRetry = true;
        try {
            const result = await sendRefreshTokenRequest()
            if (result.code == code.normal) {
                refreshLocalToken(result.data)
            } else {
                Message.error("当前身份验证过期,请重新登陆")
            }
            return await service(error.config)
        } catch (e) {
            Message.error("当前身份验证过期,请重新登陆")
        }finally {
            isRetry = false
        }
    } else {
        Message.error("当前正在重新认证，请稍等")
    }
    isRetry = false;
}

function sendRefreshTokenRequest() {
    let refreshTokenKey = getRefreshToken();
    let basic = window.btoa(`${store.state.basic.username}:${store.state.basic.password}`)
    let data = new FormData();
    data.append("userType", "BACKEND")
    data.append("grant_type", "refresh_token")
    data.append("refresh_token", refreshTokenKey)
    let config = {
        url: '/logins/oauth/token',
        data: data,
        method: 'post',
        headers: {"Authorization": basic}
    }
    return service(config);
}

function refreshLocalToken(data) {
    store.commit("storeToken", data);
}

function getRefreshToken() {
    return  store.getters.getToken.refreshToken;
}

service.interceptors.request.use(success => {
    // let basic = window.btoa(`${store.state.basic.username}:${store.state.basic.password}`);
    // if (success.url.indexOf(`${loginBase}`) != -1) {
    //     // console.log('this request is not /logins')
    //     // success.headers[`Authorization`] = `Basic ${basic}`;
    // } else {
    //     // console.log('携带了 Bearer token')
    //     // const accessToken = store.getters.getToken.accessToken;
    //     const accessToken = store.getters.getToken
    //     success.headers[`${authentication}`] = `Bearer ${accessToken}`;
    // }
    if (store.getters.getToken || localStorage.getItem('token')) {
        const accessToken = store.getters.getToken ? store.getters.getToken : localStorage.getItem('token')
        success.headers[`${authentication}`] = `Bearer ${accessToken}`;
    }
    return success;
}, failer => {
    console.log(failer)
    router.replace({path: '/'})
})

export const postKeyValueRequest = (url, params) => {
    return service({
        method: 'post',
        url: `${base}${url}`,
        data: params,
        headers: [{
            'Content-Type': 'application/x-www-form-urlencoded',
            withCredentials: true,
        }],
        transformRequest: [function (data) {
            let ret = '';
            for (let i in data) {
                ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
            }
            return ret;
        }]
    })
}

export const putKeyValueRequest = (url, params) => {
    return service({
        method: 'put',
        url: `${base}${url}`,
        data: params,
        headers: [{
            'Content-Type': 'application/x-www-form-urlencoded',
        }],
        transformRequest: [function (data) {
            let ret = '';
            for (let i in data) {
                ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
            }
            return ret;
        }]
    })
}

export const deleteKeyValueRequest = (url, params) => {
    return service({
        method: 'delete',
        url: `${base}${url}`,
        data: params,
        headers: [{
            'Content-Type': 'application/x-www-form-urlencoded',
        }],
        transformRequest: [function (data) {
            let ret = '';
            for (let i in data) {
                ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
            }
            return ret;
        }]
    })
}

export const postRequest = (url, params) => {
    return service({
        method: 'post',
        url: `${base}${url}`,
        data: params
    })
}

export const putRequest = (url, params) => {
    return service({
        method: 'put',
        url: `${base}${url}`,
        data: params
    })
}

export const getRequest = (url, params, onDownloadProgress) => {
    return service({
        method: 'get',
        url: `${base}${url}`,
        params,
        onDownloadProgress
    })
}



export const deleteRequest = (url, params) => {
    return service({
        method: 'delete',
        url: `${base}${url}`,
        data: params
    })
}

export const wsRequest = (url, params) => {
    return service({
        method: 'get',
        url: `${base}${url}`,
        data: params
    })
}

export const exportFileRequest = (url, params) => {
    return service({
        method: 'get',
        url: `${base}${url}`,
        params: params,
        responseType: 'blob',
        headers: {}
    })
}


// export const loginRequest = (url, params) => {
//     return service({
//         method: 'post',
//         url: `${loginBase}${url}`,
//         data: params,
//         headers: [{
//             'content-type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//             // withCredentials: true,
//         }],
//         transformRequest: [function (data) {
//             let ret = '';
//             for (let i in data) {
//                 ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
//             }
//             return ret;
//         }]
//     })
// }
export const loginRequest = (url, params) => {
    return service({
        method: 'post',
        url: `${base}${url}`,
        data: params,
        headers: {
            'content-type': 'application/json'
        }
        // headers: [{
        //     'content-type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        //     // withCredentials: true,
        // }],
        // transformRequest: [function (data) {
        //     let ret = '';
        //     for (let i in data) {
        //         ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
        //     }
        //     return ret;
        // }]
    })
}
