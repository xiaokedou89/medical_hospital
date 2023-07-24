<template>
    <div  style="float:left,width:100%">
        <el-menu
                class="el-menu-demo"
                mode="horizontal"
                background-color="#242424"
                text-color="#fff"
                active-text-color="#ffd04b"
        >
            <el-menu-item index="1">
                <div>
                    <span>欢迎来到工单查看系统, 当前是{{ hospitalName }}医院</span>
                    <!-- <span class="menu-div-span">若要在本地重构模型,请点击原始数据下路径进行下载,制作完成后点击提交模型即可上传模型</span> -->
                </div>
            </el-menu-item>
            <el-submenu index="2" style="float:right">
                <template slot="title">{{ username }}</template>
                <el-menu-item index="2-1" @click="logout">登出</el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>

<script>
    export default {
        name: "topHeader",
        data() {
            return {
                password: "password",
                hospitalName: ""
            };
        },
        created() {
            this.getRequest(`/work/hospital/name`).then(res => {
                this.hospitalName = res.data
            })
        },
        mounted() {

        },
        computed: {
            username: {
                get: function () {
                    return this.$store.state.username;
                }
            },
        },
        methods: {
            logout() {
                sessionStorage.removeItem(`username`);
                sessionStorage.removeItem(`token`);
                this.$store.commit(`removeUsername`);
                this.$store.commit(`removeToken`);
                this.$router.push({path: "/"});
            },
            remove() {
                sessionStorage.removeItem(`username`);
                sessionStorage.removeItem(`token`);
                this.$store.commit(`removeUsername`);
                this.$store.commit(`removeToken`);
            },
        }
    };
</script>

<style>
    .menu-div-span{
        color: #ff0000;
        margin-left: 50px;
    }
</style>
