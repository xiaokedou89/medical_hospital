// 代理
let proxyObj = {};
proxyObj['/ws'] = {
    ws: true,
    target: "ws://localhost:60004",
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    }
};
proxyObj['/api'] = {
    ws: false,
    // target: 'http://192.168.1.104:20001',
    // target:'https://medical.ll3d.com:8009/',
    // target: 'http://192.168.1.104:9070',
    // target: 'http://192.168.1.104:20001',
    // target: 'http://192.168.1.119:20001',
    target: 'http://192.168.1.104:20001',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/'
    }
};
proxyObj['/login'] = {
    ws:false,
    // target:'https://medical.ll3d.com/prod-api/',
    // target: 'http://192.168.1.104:9070',
    // target: 'http://192.168.1.114:20001',
    // target: 'http://192.168.1.119:9070',
    // target: 'http://192.168.1.119:20001',
    target: 'http://192.168.1.104:20001',
    changeOrigin: true,
    pathRewrite:{
        // '^/logins':''
        '^/api': '/'
    }
}

// 路径别名
const path = require('path');
//path.join(__dirname)设置绝对路径
function resolve(dir){ return path.join(__dirname,dir)
}
const webpack=require("webpack");

module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: 20001,
        open: true,
        proxy: proxyObj
    },
    chainWebpack:(config)=>{
        config.resolve.alias
        .set('@',resolve('./src'))
        .set('component',resolve('./src/component')) //set第一个参数：设置的别名，第二个参数：设置的路径

    },
    configureWebpack:{
        plugins:[
            new webpack.ProvidePlugin({
                $:'jquery',
                jQuery:'jquery',
                "window.jQuery":'jquery',
                Popper:['popper.js','default']
            })
        ]
    }
}
