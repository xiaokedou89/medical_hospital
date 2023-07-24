<template>
    <div>
        <el-form
                :rules="rules"
                ref="loginForm"
                v-loading="loading"
                element-loading-text="正在登录..."
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
                :model="loginForm"
                class="loginContainer"
        >
            <h3 class="loginTitle" ref="loginTitle">系统登陆</h3>
            <el-form-item prop="username">
                <el-input
                        size="normal"
                        type="text"
                        v-model="loginForm.username"
                        auto-complete="off"
                        placeholder="请输入用户名"
                        @keypress.native.enter="onSubmit"
                ></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input
                        size="normal"
                        type="password"
                        v-model="loginForm.password"
                        auto-complete="off"
                        placeholder="请输入密码"
                        @keypress.native.enter="onSubmit"
                ></el-input>
            </el-form-item>
            <el-button size="normal" style="width:100%" type="primary" @click="onSubmit">登陆</el-button>
        </el-form>
    </div>
</template>

<script>
    import {Message} from "element-ui";
    import {loginRequest} from "../utils/api.js";

    export default {
        name: "Login",
        data() {
            return {
                loading: false,
                rules: {
                    username: [
                        {required: true, message: "请输入用户名", trigger: "blur"}
                    ],
                    password: [
                        {required: true, message: "请输入密码", trigger: "blur"}
                    ]
                },
                loginForm: {
                    username: "",
                    password: ""
                    // scope: "read write",
                    // grant_type: "password",
                    // userType: "BACKEND"
                },
                checked: false,
                code: {
                    normal: 20000,
                    expire: 20003
                }
            };
        },
        methods: {
            onSubmit() {
                this.$refs.loginForm.validate(validate => {
                    if (validate) {
                        this.loading = true;
                        loginRequest(`/user/login`, this.loginForm)
                            .then(resp => {
                                this.loading = false;
                                if (resp.code == 20000) {
                                    this.$store.commit(`storeToken`, resp.data);
                                    // this.$store.commit(`storeUsername`, this.loginForm.username);
                                    let path = this.$route.query.redirect;
                                     this.$router.replace(
                                       path == "/" || path == undefined ? "/medicalupload" : path
                                     );
                                    // this.getRequest(`/work/is/native`).then(res=>{
                                        // if(res.code==20000) {
                                            //  this.$router.replace(
                                            //         path == "/" || path == undefined ? "/home" : path
                                            //     );
                                            // if(res.data == true){
                                               
                                    //         }else{
                                    //             Message.error('当前用户没有被分配到当前机构')
                                    //             this.$store.commit(`removeUsername`);
                                    //             this.$store.commit(`removeToken`);
                                    //         }
                                    //     }else{
                                    //         Message.error(`${res.msg}`)
                                    //         this.$store.commit(`removeUsername`);
                                    //         this.$store.commit(`removeToken`);
                                    //     }
                                    // })
                                } else {
                                    if (resp.code != this.code.normal && resp.code != this.code.expore) {
                                        Message.error(`${resp.msg}`);
                                    }
                                }
                            })
                            .catch(error => {
                                console.log(error)
                                this.loading = true;
                            });
                    }
                });
            }
        }
    };
</script>

<style>
    .loginContainer {
        border-radius: 15px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 15px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
    }

    .loginTitle {
        margin: 15px auto 20px auto;
        text-align: center;
        color: #505458;
    }

    .loginRemember {
        text-align: left;
        margin: 0px 0px 15px 0px;
    }

    .el-form-item__content {
        display: flex;
        align-items: center;
    }
</style>
