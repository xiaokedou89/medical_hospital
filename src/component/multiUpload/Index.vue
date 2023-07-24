<template>
    <div>
        <el-row>
            <el-col :span="24">
                <div class="grid-content bg-purple">
                    <el-upload
                            :limit="5"
                            :data="item"
                            :show-file-list="false"
                            ref="uploadModeFile"
                            action
                            :disabled="isUploadIng"
                            :auto-upload="true"
                            :http-request="fileRequest"
                            :before-upload="beforFileUpload"
                            :file-list="modelFileList"
                    >
                        <el-button size="mini" type="primary">选择文件</el-button>
                    </el-upload>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: "upload",
        data() {
            return {
                // 文件列表
                fileList: [],
            };
        },
        props: {
            id: {
                type: String,
                default: "0"
            },
            // 地址+query参数
            url: {
                type: String
            },
            // 文件类型
            fileType: {
                type: String
            },
            // 最大上传参数
            ltSize: {
                type: Number,
                default: 2
            },
            // 最小上传参数
            gtSize: {
                type: Number,
                default: 0
            },
            // 临时介绍的名称(这里先用做模型的名称)
            tempFileName: {
                type: String,
                default: ""
            },
            isUploadIng: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            isUploadIng(newVal, oldVal) {
                if (newVal) {
                    this.clear();
                }
            }
        },
        methods: {
            // 文件上传之前
            beforFileUpload(file) {
                let fileType = "image/jpeg";
                const isSpecialType = file.type == fileType;
                let gtSize = 0;
                let ltSize = 5;
                const isLt = file.size / 1024 / 1024 < ltSize;
                const isGt = file.size / 1024 / 1024 > gtSize;
                const hasModelName = this.modelName != "";
                if (!isSpecialType) {
                    this.$message.error(`当前只能上传${fileType}格式的文件`);
                }
                if (!isLt) {
                    this.$message.error(`当前上传文件不能超过${ltSize}M`);
                }
                if (!isGt) {
                    this.$message.error(`当前上传文件不能低于${gtSize}M`);
                }
                if (!hasModelName) {
                    this.dealNoModelName();
                }
                return hasModelName && isSpecialType && isLt && isGt;
            },
            fileRequest(param) {
                let data = new FormData();
                data.append(`files`, param.file);
                data.append(`modelName`, this.modelName);
                let pngPath = param.data.diagnosePngPath;
                data.append(`diagnosePngPath`, pngPath);
                this.postRequest(`/file/`, data).then(resp => {
                    if (resp.code == 20000 || resp.code == 20010) {
                        this.captureWork();
                    } else {
                        if (resp.code) {
                            this.$message.error(`${resp.message}`);
                        }
                    }
                });
            },
        }
    };
</script>

<style>
</style>
