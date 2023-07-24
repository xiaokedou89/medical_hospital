import lodash from 'lodash';

//定义全局函数并暴露出去
export default{
    install:function(Vue){
        Vue.prototype.timeStampToTime=(timestamp)=>timeStampToTime(timestamp);
        Vue.prototype.modelTrim=(model,Message)=>modelTrim(model,Message);
        Vue.prototype.sceneTrim=(scene,Message)=>sceneTrim(scene,Message);
    }
}

//定义对时间戳转换成时间的函数
function timeStampToTime(timestamp){
    var date = new Date(timestamp * 1000);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = date.getDate() + ' ';
    let h = date.getHours() + ':';
    let m = date.getMinutes() + ':';
    let s = date.getSeconds(); 
    return Y+M+D+h+m+s;
}

function modelTrim(model,Message){
    if(lodash.trim(model.name)==''){
        Message(`当前模型名字不能为空啊啊啊`);
        return false;
    }
    if(lodash.trim(model.description)==''){
        Message(`当前模型描述不能为空`);
        return false;
    }
    if(model.content!=undefined && lodash.trim(model.content)==''){
        Message(`当前模型简介不能为空`);
        return false;
    }
    return true;
}

function sceneTrim(scene,Message){
    if(lodash.trim(scene.name)==''){
        Message(`当前场景名称不能为空`);
        return false;
    }
    if(lodash.trim(scene.description)==''){
        Message(`当前场景描述不能为空`);
        return false;
    }
    return true;
}