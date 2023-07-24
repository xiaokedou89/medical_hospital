<template>
<div class="dicom_warpper">
  <div class="dicom_box">

      <div  id="global-uploader">
        <p class="text_space">选择要上传的Dicom文件的压缩包（.zip）</p>
        <!-- 上传 -->
        <uploader
          ref="uploader"
          :options="options"
          :autoStart="false"
          @file-added="onFileAdded"
          @file-success="onFileSuccess"
          @file-progress="onFileProgress"
          @file-error="onFileError"
          class="uploader-app"
        >
          <uploader-unsupport></uploader-unsupport>
          <uploader-btn
            id="global-uploader-btn"
            :attrs="attrs"
            single
            >上传dicom文件</uploader-btn
          >
          <uploader-list v-show="panelShow">
            <div
              class="file-panel"
              slot-scope="props"
              :class="{ collapse: collapse }"
            >
              <div v-if='clearFlag?props.fileList.length=0:props.fileList'>
              <ul v-if="showDataList" class="file-list" >
                <li v-for="file in props.fileList" :key="file.id">
                  <uploader-file
                    :class="'file_' + file.id"
                    ref="files"
                    :file="file"
                    :list="true"
                  ></uploader-file>
                </li>
                <div class="no-file" v-if="!props.fileList.length">
                  <i class="nucfont inuc-empty-file"></i>
                </div>
              </ul>
              </div>
            </div>
          </uploader-list>
        </uploader>
      </div>
</div>
  </div>
</template>

<script>
import { ACCEPT_CONFIG } from "@/filter/config";
import SparkMD5 from "spark-md5";
import axios from 'axios'
export default {
  name: "Upload",
  data() {
    return {
      dicomBiggerUrl: [], // 放大模型图片
      dialogTitle:"上传Dicom文件",
      dialogVisible: false,
      options: {
        target: this.$global.FileSet.uploadFileDicom, ///上传图片的地址,
        chunkSize: this.$global.FileSet.chunkSize,
        fileParameterName: "file",
        maxChunkRetries: this.$global.FileSet.maxChunkRetries,
        testChunks: true, //是否开启服务器分片校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          let objMessage = JSON.parse(message);
          if (objMessage.skipUpload) {
            return true;
          }
          return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0;
        },
        // headers: {
        //   Authorization:
        //     "Bearer " + this.$route.query.token,//JSON.parse(sessionStorage.getItem("token")).accessToken,
        // },
        query: {
          // 这里写参数
        },

      },
    //  接收的数据个格式
      attrs: {
        accept: ACCEPT_CONFIG.getAll(),
      },
      showDataList:false,
      panelShow: false, //选择文件后，展示上传panel
      collapse: false, //
      baseUrl:this.$global.imgUrl, //配置图片基础路径
      hospitalId:null,//获取医院的id
      clearFlag:false, //开关是否清空上次上传的数据列表
      tokenVal:''
    };
  },
  created(){
    console.log("上传模型页面")
    let queryId=this.$route.query.id;
    if(queryId){
      this.options.query.orderId=queryId;
    }
  },
  methods: {
    // 上传模型数据
    uploadModel() {
      this.options.query.orderId=this.$route.query.id;
      this.dialogVisible = true;  //关闭弹框
      this.showDataList=false  //上传列表隐藏
      this.clearFlag=true
    },
    // 取消操作
    cancelEvent(){
      this.dialogVisible = false;
      this.hospital='' //清空医院编码数据
      this.clearFlag=true
    },
    // 选择文件后，将上传的窗口展示出来，开始md5的计算工作
    onFileAdded(file) {
      this.clearFlag=false
      this.showDataList=true
      let suffix=""
      const type=file.fileType;
      const index=file.relativePath.lastIndexOf('.')

      if(index>=1){
        suffix=file.relativePath.substr(index)
      }
      if(suffix==='.zip'||type==='application/zip'){
        this.panelShow = true;
        //计算MD5，下文会提到
        this.computeMD5(file);
      }else{
        this.$message.error('上传文件的格式不正确请上传.zip格式')
      }

    },
    // 文件进度的回调
    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      );
    },
    // 文件上传成功后
    onFileSuccess(rootFile, file, response, chunk) {
      console.log(chunk);
      let res = JSON.parse(response);
      // 服务器自定义的错误（即虽返回200，但是是错误的情况），这种错误是Uploader无法拦截的

      if(res.code === 200){
          this.$message.success("上传成功");
            window.location.href =this.$route.query.redirect
      }else{
        this.$message.error(res.message);
        // 文件状态设为“失败”
        this.statusSet(file.id, "failed");
      }
      //  this.$forceUpdate()

       this.panelShow = false;
       this.cancelEvent()

    },
    // 文件上传失败
    onFileError(rootFile, file, response, chunk) {
      console.log(chunk);
      console.log(rootFile)
      console.log(file)
      console.log("错误");
      console.log(response)
      // this.$message.error(response.message);
    },
    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    computeMD5(file) {
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let currentChunk = 0;
      const chunkSize = 10 * 1024 * 1000;
      let chunks = Math.ceil(file.size / chunkSize);
      let spark = new SparkMD5.ArrayBuffer();
      // 文件状态设为"计算MD5"
      this.statusSet(file.id, "md5");
      file.pause();
      loadNext();
      fileReader.onload = (e) => {
        spark.append(e.target.result);
        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();
          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            $(`.myStatus_${file.id}`).text(
              "校验MD5 " + ((currentChunk / chunks) * 100).toFixed(0) + "%"
            );
          });
        } else {
          let md5 = spark.end();
          this.computeMD5Success(md5, file);
          console.log(
            `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
              file.size
            } 用时：${new Date().getTime() - time} ms`
          );
        }
      };
      fileReader.onerror = function () {
        this.error(`文件${file.name}读取出错，请检查该文件`);
        file.cancel();
      };
      function loadNext() {
        let start = currentChunk * chunkSize;
        let end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },
    computeMD5Success(md5, file) {
      file.uniqueIdentifier = md5;
      axios({
        method:'get',
        url:`${this.$global.baseUrl}/file/breakPoint?identifier=${md5}`,
        // headers:{
        //   Authorization:this.tokenVal,
        // }
        // this.getRequest(`/file/breakPoint?identifier=${md5}`)
      }).then((res) => {
        if (res.code != 20000) {
          console.log(res.message);
        }
        file.resume();
      });
      this.statusRemove(file.id);
    },
    fileListShow() {
      let $list = $("#global-uploaders .file-list");
      if ($list.is(":visible")) {
        $list.slideUp();
        this.collapse = true;
      } else {
        $list.slideDown();
        this.collapse = false;
      }
    },
    close() {
      // this.uploader.cancel();
      this.panelShow = false;
      this.dialogVisible = false;
    },
    /**
     * 新增的自定义的状态: 'md5'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {
      let statusMap = {
        md5: {
          text: "校验MD5",
          bgc: "#fff",
        },
        merging: {
          text: "合并中",
          bgc: "#e2eeff",
        },
        transcoding: {
          text: "转码中",
          bgc: "#e2eeff",
        },
        failed: {
          text: "上传失败",
          bgc: "#e2eeff",
        },
      };
      this.$nextTick(() => {
        $(`<span class="myStatus_${id}"></span>`)
          .appendTo(`.file_${id} .uploader-file-status`)
          .css({
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: "1",
            backgroundColor: statusMap[status].bgc,
          })
          .text(statusMap[status].text);
      });
    },
    statusRemove(id) {
      this.$nextTick(() => {
        // console.log("移除id");
        $(`.myStatus_${id}`).remove();
      });
    },
    error(msg) {
      this.$notify({
        title: "错误",
        message: msg,
        type: "error",
        duration: 2000,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.dicom_warpper{
  position: relative;
}
.dicom_box{
   width: 400px;
    height: 150px;
    border: 1px solid #ccc;
    overflow: hidden;
    position:absolute;
        margin-top: 15%;
        border-radius: 5px;
        text-align: center;
    left:50%;
    margin-left:-200px;
    padding: 10px;
}
.button_space {
  margin: 10px auto;
}
.show-png-btn {
  margin: 2vh;
  float: right;
}

.work-details-table {
  width: 100%;
  margin-top: 2vh;
}

.model-name {
  margin: 1vh;
  width: 40vh;
  float: right;
}

/* 上传文件温馨提示 */
.uploadModelPrompt {
  margin-top: 1vh;
  margin-left: 2vh;
  height: 3vh;
  width: 3vh;
}

.hasModel {
  color: green;
}

.noModel {
  color: red;
}

.show-png {
  margin-bottom: 10px;
}
 ul{
      list-style: none;
    padding-left: 0px;}
#global-uploaders {
  min-height: 100px;
  position: relative;
  .uploader-app {
    // width: 520px;
  }
  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;
      h2 {
        margin: 0;
        padding: 0;
      }
      .operate {
        flex: 1;
        text-align: right;
      }
    }

    .file-list {
      position: relative;
      height: 40px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      padding-left: 0px;
      list-style: none;
      > li {
        background-color: #fff;
      }
    }
    &.collapse {
      .file-title {
        background-color: #e7ecf2;
      }
    }
  }
  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }
  .uploader-file-icon {
    &:before {
      content: "" !important;
    }
    &[icon="image"] {
      background: url("./content/work/images/image-icon.png");
      // background: url(./images/image-icon.png);
    }
    &[icon="video"] {
      //  background:#00f
      background: url("./content/work/images/video-icon.png");
    }
    &[icon="document"] {
      //  background:#ff0
      background: url("./content/work/images/text-icon.png");
    }
  }
  .uploader-file-actions > span {
    margin-right: 6px;
  }
}
/* 隐藏上传按钮 */
#global-uploader-btn {
  clip: rect(0, 0, 0, 0);
}
.uploader-btn {
  display: inline-block;
  position: relative;
  padding: 7px 15px;
  font-size: 12px;
  color: #fff;
  border: 1px solid #409eff;
  cursor: pointer;
  border-radius: 3px;
  background: #409eff;
  outline: none;
  margin-bottom: 10px;
}
.uploader-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
  color: #409eff;
}

.picture_box{
  width:100px;
  height:100px;
}
.select_picture{
    height:400px;
    border:1px solid #eee;
        overflow-y: scroll;
    .select_pic_box{
      height:auto;
      min-height:400px;
    }

  ul{
    list-style: none;
    padding:0;
    li{
        display: inline-block;
        border:1px solid #ddd;
        padding:4px;
        margin:5px;
        position: relative;
        width:100px;
        height:100px;
        border-radius: 5px;
        image{
            width:100px;
            height:100px;
        }
        .i_round,.i_round_fill{
            position: absolute;
            top: 3px;
            left: 3px;
            border-radius:50%;
        }
        .i_round,.i_round:hover{
            width:20px;
            height:20px;
            border:1px solid #ddd;
            background:#d4d4d4;
        }
        .i_round:hover{
            background:#ffcbcb;
        }
        .i_round_fill{
            font-size: 14px;
            color: #ff5d56;
            background: #ffcbcb;
            padding: 3px;
            border: 1px solid #fbb9c8;
        }
    }
  }
}
.text_space{
    margin-top:0;
        color: #ff4040;
    font-weight: bold;
}
.empty{
  text-align: center;
    margin: 0 auto;
    position: absolute;
    width: 100%;
}
.happy-scroll
.happy-scroll-container{
  width:100% !important;
  height:100% !important;
}
</style>
