<template>
  <div>
    <div class="button_space">
      <el-button size="small" type="primary" @click="uploadOrigin()">上传</el-button>
    </div>
    <div v-loading="loading">
      <!-- 工单信息 -->
      <template>
        <el-table
          :data="workTable"
          border
          class="work-details-table"
          highlight-current-row
        >
          <el-table-column label="任务号" prop="id"> </el-table-column>
          <el-table-column label="检查片号" prop="patientId"> </el-table-column>
          <el-table-column label="检查单号" prop="diagnoseReportNo">
          </el-table-column>
          <el-table-column label="医院编码" prop="hospitalCode">
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="290">
            <template slot-scope="{row}">
               <el-tooltip v-if="row.isImage===false" class="item" effect="dark" content="工单错误没有与之相匹配的订单" placement="top">
               <el-button  size="small" type="danger">工单错误</el-button>
               </el-tooltip>
              <div v-else>
                <el-button :disabled="row.modelDto!=null && row.modelDto.length>0 ? true: false"  size="small" type="primary" @click="uploadModel(row)" >上传模型</el-button>
              <!-- isImage true 可以点 false 不可以点； isModel true 可以点 false 不可以点 -->
              <el-button size="small"   @click="uploadManagement(row)" :disabled="row.isImage && row.images!=null && row.images.length>0 ? false : true">管理图片</el-button>
              <el-button size="small" type="primary" :disabled="row.isModel?false:true" @click="uploadWork(row)">完成工单</el-button>
              </div>
              
            </template>     
          </el-table-column>          
        </el-table>
      </template>
    </div>

<!-- 上传原始文件-->
    <el-dialog
      :title="dialogTitle[dialogStatus]"
      :visible.sync="dialogVisible"
      width="80%"
    >
      <!-- 选择图片区域，图片类别 -->
      <!-- <div v-show="pictureFlag"> -->
        <div v-if="pictureFlag">
        <p class="text_space">选择需要删除的图片</p>
        <div class="select_picture">
        <!-- <happy-scroll color="rgba(51,51,51,0.2)" resize  size="8" hide-horizontal> -->
          <div class="select_pic_box">
            <ul v-if="srcList!=null && srcList.length>0" >
                <li v-for="(item,index) in srcList" :key="index">
                    <img :src="baseUrl+item.img" class="picture_box"/>
                    <i  :class="item.selectFlag === true?'i_round_fill el-icon-delete-solid':'i_round'" @click="selectEvent(item)"></i>               
                </li>
            </ul>  
            <div v-else class="empty">暂无数据</div> 
            </div> 
        <!-- </happy-scroll> -->
        </div>
      </div>

      <el-form>
        <!-- 上传原始数据，原始数据类别 -->
        <el-form-item  v-show="dialogStatus==='origin'" label="医院">
          <!-- 选择医院 -->
          <el-select 
            v-model="hospital"
            size="mini"
            filterable 
            placeholder="原始数据所在医院"
            @change="selectChanged"
            @focus="getHosiptal"
          >
            <el-option
              v-for="(item,index) in hospitalData"
              :key="item.name +index"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <!-- 上传 模型 和 dicom文件 -->
        <div v-show="modelFlag" id="global-uploader">
          <p class="text_space">选择要上传的{{dialogStatus==='origin' ? '.dicom文件' :'模型文件'}}的压缩包（.zip）</p>
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
            <el-button v-if="dialogStatus==='origin'&& hospitalCodeFlag" size="small" disabled type="primary">上传原始文件</el-button>
            <!-- <el-button v-if="dialogStatus==='origin'&& false" size="small" disabled type="primary">上传原始文件</el-button> -->
            <uploader-btn v-else
              id="global-uploader-btn"
              :attrs="attrs"
              single
            >
              {{dialogStatus==='origin' ? '上传原始文件' :'上传模型文件'}}
            </uploader-btn>
            <uploader-list v-show="panelShow">
              <div
                class="file-panel"
                slot-scope="props"
                :class="{ collapse: collapse }"
              >
                <div class="file-title">
                  <h2>文件列表</h2>
                  <div class="operate">
                    <el-button
                      @click="fileListShow"
                      type="text"
                      :title="collapse ? '展开' : '折叠'"
                    >
                      <i class="iconfont" :class=" collapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
                    </el-button>
                  <!-- <el-button @click="close" type="text" title="关闭">
                                        <i class="iconfont icon-close">关闭</i>
                                    </el-button> -->
                  </div>
                </div>
              <!--  -->
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
                      <i class="nucfont inuc-empty-file"></i> 暂无待上传文件
                    </div>
                  </ul>
                </div>
              </div>
            </uploader-list>
          </uploader>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer" v-if="this.dialogStatus==='picture'">
          <el-button  size="mini" @click="cancelEvent">取消</el-button>
        <el-button type="primary" size="mini" @click="pictureFlag===true?pritureDelete():close()">确认</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { Message } from "element-ui";
// import funHelper from "lodash/function";
import { ACCEPT_CONFIG } from "@/filter/config";
import SparkMD5 from "spark-md5";
// import { HappyScroll } from 'vue-happy-scroll';

export default {
  name: "work",
  // components:{ HappyScroll },
  data() {
    return {
      // 工单的信息
      workTable: [],
      dicomBiggerUrl: [], // 放大模型图片
      // 上传弹框标题对象
      dialogTitle: {
        model: "上传模型",
        origin: "上传原始数据",
        picture:'管理图片'
      },
      // 弹框类别
      dialogStatus: "",
      dialogVisible: false,
      hospital: '',
      hospitalData: [],
      options: {
        ///上传图片的地址,
        // target: this.$global.FileSet.uploadFile,
        target: this.$global.FileSet.globalUploadFile, 
        chunkSize: this.$global.FileSet.chunkSize,
        fileParameterName: "file",
        maxChunkRetries: this.$global.FileSet.maxChunkRetries,
        testChunks: true, //是否开启服务器分片校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          console.log(chunk)
          console.log(message)
          let objMessage = JSON.parse(message);
          if (objMessage.skipUpload) {
            return true;  
          }
          return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0;
        },
        // headers: {
        //   Authorization:
        //     "Bearer " + JSON.parse(sessionStorage.getItem("token")).accessToken,
        // },
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem('token'))}`
        },
        query: {
          // 这里写参数
          hospitalId: 2
        },
       
      },
    //  接收的数据个格式
      attrs: {
        accept: ACCEPT_CONFIG.getAll(),
      },
      showDataList:false,
      panelShow: false, //选择文件后，展示上传panel
      collapse: false, //
      randomlyId: null, //得到的id
      srcList:[], //存放图片
      //配置图片基础路径 
      // baseUrl:this.$global.imgUrl, 
      baseUrl:this.$global.globalImgUrl,
      selectFlag:true, //选择删除图片
      storePicture:[], //存放图片
      modelFlag:false, //是否显示模型上传
      pictureFlag:false, //图片列表是否显示
      disabledFlag:false, //控制按钮是否可用
      hospitalId:null,//获取医院的id
      clearFlag:false, //开关是否清空上次上传的数据列表
      hospitalCodeFlag:true, //设置原始数据上传开关
      loading:true,
    };
  },
  created(){
       // 如果需要id
    this.initDateId();
    
    console.log(`Bearer ${JSON.parse(sessionStorage.getItem('token'))}`)
    
  },
  mounted(){
    
   // 初始化数据
    this.captureWork();
   
  },
  methods: {
    getHosiptal(){
      this.allData();
    },
    async allData(){
      // 返回数据值
      let list = await this.initHospitalCode('/work/hospital')
      if(!list){
        return
      }
      // 遍历数据添加的指定数组中
      list.forEach(ele=>{
        this.hospitalData.push({name:ele.name,code:ele.code})
      })
    },
    // 获取医院列表
    initHospitalCode(path){
     return this.getRequest(`${path}?name=${this.hospital}`).then((res) => {
        if(res.code===20000){
         return res.data
        }else{
          console.log(res)
          // this.$message.error(res.message)
        }
      }).catch(err=>{
        return Promise.reject(err)
      })
    },
    
    /* ====================   初始化类   ====================*/
    // =====> created里调用
    // 获取当前工单管理医院
    initDateId() {
      this.getRequest(`/file/task`).then((res) => {
        console.log(res)
        if (res.code == 20000) {
          // 可以出入id
          
          this.options.query.id=res.data
          this.hospitalId=res.data
        } else {
          Message.error(`${res.message}`);
        }
      });
    },
    // =====> mounted里调用
    // 获取工单
    captureWork() {
      this.getRequest(`/work/cache`).then((res) => {
        console.log(res)
        this.loading=false
        if (res.code == 20000) {
          let arr = res.data;
           this.workTable=arr;
        }
      });
    },
    /* ====================   分隔   ====================*/
    /* ====================   绑定事件类   ====================*/

    // =====> 点击上传按钮
     //上传原始数据
    uploadOrigin() {
      this.modelFlag = true
      this.dialogVisible = true;
      this.dialogStatus = "origin";
      this.options.query.type=0;
      this.showDataList= false
      this.pictureFlag = false
      this.clearFlag=true
    },
    // =====> 点击上传模型按钮
    // =====> 选择要删除的图片事件
    // 选择指定图片
    selectEvent(item){
      // 
      const newData=this.storePicture;
      const result= newData.some(ele=>{
            return ele.img===item.img
        })
        // 判断是否存在数组中
        if(result){
          newData.forEach((ele,index,newData)=>{
             if(ele.img === item.img){
                newData.splice(index,1)
             }
          })  
        }else{
          newData.push(item) 
        }
        this.storePicture=newData
        // 添加图片的选中取消值
        this.srcList.forEach(ele=>{
            if(ele.img===item.img){
                ele.selectFlag=!item.selectFlag
            }
        })
    },
    // =====> 上传类别为图片时，点击弹框确定事件删除图片
    // 确认删除图片
    pritureDelete(){
      let pathData=this.storePicture.map(item=>{
        return item.img
      })
      if(pathData!=[] && pathData.length>0){
        let data = new FormData();
        data.append(`paths`, pathData);
        this.deleteRequest(`/file/image/${this.randomlyId}`,data ).then(res => {
          if(res.code===20000){
            this.$message.success("删除成功")     
            this.captureWork();
          }else{
            this.$message.error(res.message) 
          }
        }) 
      }
     this.dialogVisible = false;
    }, 
    // 上传模型数据
    uploadModel(row) {
      this.options.query.type=1
      this.options.query.hospitalCode=row.hospitalCode
      this.options.query.id=row.id
      this.dialogVisible = true;  //关闭弹框
      this.dialogStatus = "model";
      this.modelFlag = true  //
      this.pictureFlag = false  //图片不可点
      this.showDataList=false  //上传列表隐藏
      this.clearFlag=true
    },
    // =====> 点击管理图片按钮(上传图片)
    // 上传管理图片
    uploadManagement(row){ 
      this.captureWork();
      this.modelFlag = false
      this.pictureFlag = true
      this.dialogVisible = true;
      this.dialogStatus = "picture";
      this.randomlyId=row.id
      let imagesArr=row.images;
      let list=imagesArr!=null && imagesArr.length>0 ? imagesArr : [];
      let newList=new Array();
          list.forEach(item=>{
            const obj={};
            obj.selectFlag=false;
            obj.img=item;
            newList.push(obj)
          }) 
      this.srcList=newList

    },
    // =====> 点击完成工单按钮
    // 完成工单
    uploadWork(row){
     this.$confirm('确定要提交工单吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.postRequest(`/work/commit/${row.id}`).then(res=>{
            console.log('完成工单响应')
            console.log(res)
            if(res.code===20000){ 
              this.disabledFlag=true
              this.$message.success('提交成功!'); 
            }else{
              this.$message.error(res.message)
            }
            this.$forceUpdate();
            this.captureWork();
            
          })
        }).catch(() => {
          console.log('已取消删除');          
        });
    },
    // =====> 原始数据选择医院事件
    // 医院编码发生改变时
    selectChanged(val){
      if(val!=null|| val!=''){
        // 返回指定的obj对象
       const obj= this.hospitalData.find(item=>{
          return item.name===val
        })
        // 获取code 编码
        this.options.query.hospitalId=obj.id
        this.hospitalCodeFlag=false  //是否原始数据可上传
      }
    },  
    // =====> 上传选择文件添加后回调事件
    // 选择文件后，将上传的窗口展示出来，开始md5的计算工作
    onFileAdded(file) {
      console.dir(this.$refs.uploader)
      this.clearFlag=false
      this.showDataList=true
      let suffix=""
      const type=file.fileType;
      console.log(file)
      console.log(type)
      const index=file.relativePath.lastIndexOf('.')
      
      // 根据文件路径截取文件后缀
      if(index>=1){
        suffix=file.relativePath.substr(index)
        console.log(suffix)
      }

      // 判断文件后缀为.zip 文件格式
      if(suffix==='.zip'||type==='application/zip'){
        this.panelShow = true;
        //计算MD5，下文会提到
        console.log(file)
        this.computeMD5(file);
      }else{
        this.$message.error('上传文件的格式不正确请上传.zip格式')
      }
    },
    // =====> 上传文件成功后回调
    // 文件上传成功后
    onFileSuccess(rootFile, file, response, chunk) {
      console.log('上传成功')
      console.log(chunk);
      let res = JSON.parse(response);
      // 服务器自定义的错误（即虽返回200，但是是错误的情况），这种错误是Uploader无法拦截的
     
      if(res.code === 200){
          this.$message.success("上传成功");
          this.captureWork();  
      }else{
        this.$message.error(res.message);
        // 文件状态设为“失败”
        this.statusSet(file.id, "failed");
        this.captureWork();  
      }    
      //  this.$forceUpdate() 
        
       this.panelShow = false;
       this.cancelEvent()
      
    },
    // =====> 上传文件进度
    // 文件进度的回调
    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      );
    },
    // ====> 上传文件失败钩子
    // 文件上传失败
    onFileError(rootFile, file, response, chunk) {
      console.log('文件上传失败')
      console.log(chunk);
      console.log(rootFile)
      console.log(file)
      console.log("错误");
      console.log(response)
      // this.$message.error(response.message);
       this.captureWork(); 
    },
    /* ====================   分隔   ====================*/
    /* ====================   工具回调类   ====================*/
    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    // =====> 计算MD5添加文件时回调
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
    // =====> 计算MD5中回调
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
    // =====> 计算切割文件完毕发送请求 
    computeMD5Success(md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      // Object.assign(this.options, {
      //     query: {
      //         // ...this.params,
      //         type:0
      //     }
      // })
      // console.log("计算完成后")
      file.uniqueIdentifier = md5;
      this.getRequest(`/file/breakPoint?identifier=${md5}`).then((res) => {
        if (res.code != 20000) {
          console.log(res.message);
        }
        file.resume();
      });
      this.statusRemove(file.id);
    },


    /* ====================   分隔   ====================*/
    // 取消操作
    cancelEvent(){
      this.modelFlag = false
      this.pictureFlag = false
      this.dialogVisible = false;
      this.storePicture = [];
      this.hospital='' //清空医院编码数据
       this.clearFlag=true
        this.hospitalCodeFlag=false
    },
    
    fileListShow() {
      let $list = $("#global-uploader .file-list");
      if ($list.is(":visible")) {
        $list.slideUp();
        this.collapse = true;
      } else {
        $list.slideDown();
        this.collapse = false;
      }
    },
    close() {
      this.captureWork();
      // this.uploader.cancel();
      this.panelShow = false;
      this.dialogVisible = false;
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
    }
    


  },
};
</script>

<style scoped lang="scss">
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
#global-uploader {
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
      height: 240px;
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
      background: url("./images/image-icon.png");
      // background: url(./images/image-icon.png);
    }
    &[icon="video"] {
      //  background:#00f
      background: url("./images/video-icon.png");
    }
    &[icon="document"] {
      //  background:#ff0
      background: url("./images/text-icon.png");
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
