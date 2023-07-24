<template>
  <div class="bg_bottom">
    <!-- 头部 -->
    <div class="header">
      <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#242424"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="1">
          <div>
            <span>欢迎来到工单查看系统</span>
          </div>
        </el-menu-item>
          <el-submenu v-show="!doctorFlag" index="2" style="float:right">
            <el-menu-item index="2-1" @click="logout">登出</el-menu-item>
          </el-submenu>
        </el-menu>
    </div>
    <!-- 主体部分 -->
    <div class="screenpix">
      <!-- 上传按钮 -->
      <div class="button_space" >
        <el-button v-show="doctorFlag" size="small" type="primary" @click="uploadOrigin()">上传</el-button>
      </div>
      <!-- 主体列表 -->
      <div v-show="!doctorFlag" v-loading="loading">
        <!-- 筛选框 -->
        <div class="filter-box" style="margin-top: 20px">
          <el-form :inline="true" size="small">
            <el-form-item label="订单筛选">
              <el-select v-model="params.status" placeholder="请选择订单状态" @change="statusChange">
                <el-option
                  v-for="item in statusArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <!-- 工单信息 -->
        <el-table
          :data="list"
          border
          class="work-details-table"
          highlight-current-row
        >
          <el-table-column align="center" label="工单号" prop="id"> </el-table-column>
          <el-table-column align="center" label="订单号" prop="orderId"> </el-table-column>
          <el-table-column align="center" label="病人姓名" prop="patientName"> </el-table-column>
          <el-table-column align="center" label="检查单号" prop="diagnoseReportNo">
          </el-table-column>
          <el-table-column align="center" label="病历号" prop="medicalRecordNo">
          </el-table-column>
          <el-table-column align="center" fixed="right" label="操作" >
            <template slot-scope="{row}">
              <!-- isImage为false工单错误 -->
              <!-- <el-tooltip v-if="row.isImage===false" class="item" effect="dark" content="工单错误没有与之相匹配的订单" placement="top">
                <el-button  size="small" type="danger">工单错误</el-button>
              </el-tooltip> -->
              <div class="action-btn-group">
                <el-button size="small" type="text"  @click="uploadOrigin(row)">上传原始文件</el-button>
                <!-- 下载 DICOM -->
                <el-button size="small" type="text" :loading="row.downloading" :disabled="!row.dicomPath" @click="download(row)">{{ !row.downloading ? '下载原始文件' : row.percentage}}</el-button>
                <!-- 上传模型 -->
                <el-button :disabled="row.status == 20 && !!row.dicomPath ? false : true"  size="small" type="text" @click="uploadModel(row)" >上传模型</el-button>
                <!-- 管理图片 -->
                <el-button size="small" type="text"  @click="uploadManagement(row)" :disabled="row.status > 10 && row.snapshot? false : true">管理图片</el-button>
                <!-- 完成工单 -->
                <el-button size="small" type="text" :disabled="row.modelData && row.status !=30 ? false : true" @click="uploadWork(row)">完成工单</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!doctorFlag" class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange"></pagination>
      </div>
      <div v-show="doctorFlag" class="message-container">
        <div v-if="!messageShow">请您点击上传按钮，选择要上传的DICM文件</div>
        <div v-else>上传已成功，请您关闭页面退出</div>
      </div>
      <!-- 上传弹框 -->
      <el-dialog
        :title="dialogTitle[dialogStatus]"
        :visible.sync="dialogVisible"
        width="80%"
      >
        <!-- 选择图片部分、图片类别 -->
        <div v-show="!doctorFlag && pictureFlag">
          <p class="text_space">选择要删除的图片</p>
          <div class="select_picture">
            <div class="select_pic_box">
              <!-- 图片列表 -->
              <ul v-if="srcList != null && srcList.length > 0">
                <li v-for="(item, index) in srcList" :key="index">
                  <!-- <img :src="baseUrl + item.img" class="picture_box" /> -->
                  <!-- <img :src="tecentUrl + item.img" class="picture_box" /> -->
                  <el-image
                    class="picture_box"
                    :src="tecentUrl + item.img"
                    :preview-src-list="[tecentUrl + item.img]"
                  ></el-image>
                  <i 
                    :class="item.selectFlag === true? 'i_round_fill el-icon-delete-solid' : 'i_round'"
                    @click="selectEvent(item)"
                  ></i> 
                </li>
              </ul>
              <div v-else class="empty">暂无数据</div>
            </div>
          </div>
        </div>


        <el-form>
          <!-- 选择医院，当非医生点击链接进入才显示 -->
          <!-- <el-form-item v-show="dialogStatus === 'origin' && !doctorFlag" label="医院">
            <el-select
              v-model="hospital"
              size="mini"
              filterable
              placeholder="原始数据所在医院"
              @change="selectChanged"
              @focus="getHosiptal"
            >
              <el-option 
                v-for="(item, index) in hospitalData"
                :key="item.name + index"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item> -->
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
              <!-- 显示的上传按钮 -->
              <!-- <el-button v-if="dialogStatus === 'origin' && hospitalCodeFlag" size="small" disabled type="primary">上传原始文件</el-button> -->
              <uploader-btn id="global-uploader-btn" :attrs="attrs" single>
                {{dialogStatus==='origin' ? '上传原始文件' :'上传模型文件'}}
              </uploader-btn>
              <!-- 上传文件区域 -->
              <uploader-list v-show="panelShow">
                <div
                  class="file-panel"
                  slot-scope="props"
                  :class="{ collapse: collapse }"
                >
                  <!-- 文件列表头部 -->
                  <div class="file-title">
                    <h2>文件列表</h2>
                    <!-- 头部折叠按钮区域 -->
                    <div class="operate">
                      <el-button type="text" :title="collapse ? '展开' : '折叠' " @click="fileListShow">
                        <i class="iconfont" :class="collapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
                      </el-button>
                    </div>
                  </div>
                  <!-- 添加上传的文件列表部分 -->
                  <div v-if='clearFlag?props.fileList.length=0:props.fileList'>
                    <ul v-if="showDataList" class="file-list" >
                      <li v-for="file in props.fileList" :key="file.id">
                        <uploader-file
                          :class="'file_' + file.id"
                          ref="files"
                          :file="file"
                          :list="true"
                        ></uploader-file>
                        <div class="no-file" v-if="!props.fileList.length">
                          <i class="nucfont inuc-empty-file"></i> 暂无待上传文件
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </uploader-list>
            </uploader>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer" v-if="dialogStatus ==='picture' && !doctorFlag ">
           <el-button size="mini" @click="cancelEvent">取消</el-button>
           <el-button type="primary" size="mini" @click="pictureFlag === true ? pictureDelete() : close() ">确认</el-button> 
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import store from '../store';
import Vue from 'vue';
import SparkMD5 from "spark-md5";
import * as global from '@/utils/global.js'
import pagination from '@/component/pagination/pagination.vue'

const defaultParams = {
  size: global.size,
  pkId: 0,
  sortMode: 'DESC',
  status: 10
}

export default {
  name: 'medicalUpload',
  data() {
    return {
      statusArr: global.statusArr,
      statusFlag: false,
      tecentUrl: global.modelUrl,
      // 分页显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      maxId: 0,
      minId: 0,
      // 获取工单参数
      params: Object.assign({}, defaultParams),
      // 医生点击链接进入时拉取的token
      workerToken: null,
      // 是否是医生点击路由进入的页面
      doctorFlag: false,
      // 路由传进来的订单id
      orderId: null,
      // 路由传进来的工单id
      workId: null,
      hospital: '',
      hospitalId: null,
      // 医院选择绑定数组
      hospitalData: [],
      // 工单数据数组
      list: [],
      // 存放图片
      srcList: [],
      storePicture:[], //存放图片
      // 配置图片基本路径
      baseUrl: this.$global.globalImgUrl,
      // 上传弹框标题对象
      dialogTitle: {
        model: '上传模型',
        origin: '上传原始数据',
        picture: '管理图片'
      },
      // 上传弹框标题对象
      dialogStatus: '',
      // 上传弹框开关
      dialogVisible: false,
      // 上传uploader的配置对象
      options: {
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
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem('token'))}`
        },
        query: {
          // 这里写参数
          
        },
       
      },
      // 接收的数据格式
      attrs: {
        accept: ['.zip']
      },
      // 弹框的上传部分v-show开关
      modelFlag: false,
      // 上传弹框的图片管理区域开关
      pictureFlag: false,
      // 上传的文件列表开关
      showDataList: false,
      //开关是否清空上次上传的数据列表
      clearFlag: false,
      //选择文件后，展示上传panel
      panelShow: false,
      // 上传文件列表部分是否折叠
      collapse: false,
      hospitalCodeFlag: true,
      // 得到的id
      randomlyId: null,
      // 显示对医生的上传提示
      messageShow: false,
      loading: false
    }
  },
  components: {
    pagination
  },
  created() {
    if (this.$route.query && this.$route.query.orderId && this.$route.query.workId) {
      // this.getToken()
      this.orderId = +this.$route.query.orderId
      // this.hospitalId = +this.$route.query.hospitalId
      this.workId = +this.$route.query.workId
      this.options.query.id = +this.$route.query.workId
      this.options.headers = {}
      this.doctorFlag = true
      this.hospitalCodeFlag = false
    } else {
      this.captureWork(this.params)
    }
    console.log('doctorFlag is')
    console.log(this.doctorFlag)
    // console.log(`Bearer ${JSON.parse(sessionStorage.getItem('token'))}`)
  },
  watch: {
    workerToken(val) {
      if (val) {
        this.options.headers['Authorization'] = `Bearer ${val}`
      }
    },
    dialogVisible(val) {
      if (val) {
        this.hospital = ''
        this.hospitalData = []
      }
    }
  },
  methods: {
    /* ===================================   初始化事件  ================================= */
    // 如果是医生点击链接进入拉取工作人员token
    getToken() {
      this.getRequest('/user/worker')
        .then(res => {
          console.log('getToken')
          console.log(res)
          if (res.code === 20000) {
            this.$store.commit(`storeToken`, res.data);
            this.workerToken = res.data
          } else {
            this.$message.error('获取工作人员信息失败，请重新进入或联系管理员')
          }
        })
        .catch(() => {
          this.$message.error('获取工作人员信息失败，请重新进入或联系管理员')
        })
    },
    /* ===================================   绑定事件  ================================= */
    //获取工单回调
    captureWork(params) {
      this.loading = true
      this.getRequest('/work', params).then(res => {
          console.log('获取的工单')
          console.log(res)
          this.loading = false
          this.flag = false
          if (res.code === 20000) {
            this.list = res.data
            this.sortList()
            for (let item of this.list) {
              if (item.snapshot) {
                item.snapshot = JSON.parse(item.snapshot)
              }
              Vue.set(item, 'downloading', false);
              Vue.set(item, 'percentage', '0%');
            }
            this.statusFlag = false
          } else if (res.code === 20004) {
            this.$message({
              message: '没有更多数据',
              type: 'warning',
              duration: 1500
            })
            this.statusFlag && (this.list = [])
            if (this.params.sortMode == 'DESC') {
              this.pageCount !== 1 && this.pageCount--
            } else {
              this.pageCount !== 1 && this.pageCount++
            }
          } 
        })
        .catch(err => {
          this.loading = false
          this.flag = false
          this.statusFlag = false
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--;
          } else {
            this.pageCount !== 1 && this.pageCount++;
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    sortList() {
      this.list.sort((a, b) => {
        if (a.id > b.id) {
          return -1
        } else if (a.id < b.id) {
          return 1
        } else {
          return 0
        }
      })
      this.maxId = this.list[0].id
      this.minId = this.list[this.list.length - 1].id
    },    
    nextPage() {
      if (!this.flag) {
        this.flag = true
        this.pageCount++
        this.params.sortMode = 'DESC'
        this.params.pkId = this.minId
        this.captureWork(this.params)
      } else {
        return
      }
    },
    prevPage() {
      if (this.pageCount <= 1) {
        return
      } else {
        if (!this.flag) {
          this.flag = true
          this.pageCount--
          this.params.sortMode = 'ASC'
          this.params.pkId = this.maxId
          this.captureWork(this.params)
        } else {
          return
        }
      }
    },
    pageSizeChange(e) {
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.pageCount = 1
      this.captureWork(this.params)
    },
    statusChange(e) {
      console.log(e)
      this.statusFlag = true
      this.params.status = e
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.pageCount = 1
      this.captureWork(this.params)
    },
    // 下载原始文件
    download(item) {
      item.downloading = true
      let base = '/api',
          url =  `${base}/file/dicom?path=${item.dicomPath}`,
          xhr = new XMLHttpRequest();
      xhr.open('get', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${store.getters.getToken}`);
      xhr.responseType = 'blob';
      console.log(xhr);
      xhr.onprogress = function (e) {
        item.percentage = ((e.loaded / e.total) * 100).toFixed(0) + '%';
      };
      xhr.onload = function () {
        let blob,
            a,
            fileURL;
        if (this.status >= 200 && this.status < 300 || this.status == 304) {
          blob = this.response;
          a = document.createElement('a');
          fileURL = window.URL.createObjectURL(blob);
          a.href = fileURL;
          a.download = 'dicom.zip';
          a.click();
          item.downloading = false;
          item.percentage = '0%';
          window.URL.revokeObjectURL(fileURL);
        } else {
          item.downloading = false;
          this.$message({
            message: '下载失败，请稍后再试或联系管理员',
            type: 'error',
            duration: 1500
          })
        }
      };
      xhr.send();
    },
    // 上传弹框医院选择输入事件
    getHosiptal() {
      this.hospital = ''
      this.hospitalData = []
      this.allData()
    },
    async allData() {
      let list = await this.initHospitalCode('/work/hospital')
      if (!list) {
        return
      }
      list.forEach(ele => {
        this.hospitalData.push({name: ele.name, id: ele.id})
      })
    },
    initHospitalCode(path) {
      return this.getRequest(`${path}?name=${this.hospital}`)
        .then(res => {
          if (res.code === 20000) {
            return res.data
          } else {
            console.log(res)
          }
        })
        .catch(err => {
          return Promise.reject(err)
        })
    },
    // 点击头部登出按钮
    logout() {
      sessionStorage.removeItem(`token`);
      this.$store.commit(`removeToken`);
      this.$router.push({path: "/"});
    },
    // 点击弹框取消按钮
    cancelEvent() {
      this.modelFlag = false
      this.pictureFlag = false
      this.dialogVisible = false
      this.storePicture = []
      this.clearFlag = true
      // 清空医院信息
      // this.hospital = ''
      this.hosptialCodeFlag = false
    },
    // 当弹框为picture时点击弹框确认按钮(删除图片)
    pictureDelete() {
      let pathData = this.storePicture.map(item => {
        return item.img
      })
      console.log(pathData)
      if (pathData != [] && pathData.length > 0) {
        let data = new FormData()
        // data.append('paths', pathData)
        data.append('filename', pathData)
        this.deleteRequest(`/file/image/${this.randomlyId}`, data)
          .then(res => {
            console.log(res)
            if (res.code === 20000) {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 1500
              })
              this.captureWork(this.params)
            } else {
              this.$message.error(res.message)
            }
          })
      }
      this.dialogVisible = false
    },
    // 弹框非picture点击确认
    close() {
      if (!this.doctorFlag) {
        this.captureWork(this.params);
      }
      
      // this.uploader.cancel();
      this.panelShow = false;
      this.dialogVisible = false;
    },
    // 弹框选择图片点击事件
    selectEvent(item) {
      console.log(item)
      const storeData = this.storePicture
      const result = storeData.some(ele => {
        return ele.img === item.img
      })
      if (result) {
        storeData.forEach((ele, index, storeData) => {
          if (ele.img === item.img) {
            storeData.splice(index, 1)
          }
        })
      } else {
        storeData.push(item)
      }
      this.storePicture = storeData
      this.srcList.forEach(ele => {
        if (ele.img === item.img) {
          ele.selectFlag = !item.selectFlag
        }
      })
    },
    // 医院选择框选择事件
    selectChanged(val) {
      if (val != null || val != '') {
        const obj = this.hospitalData.find(item => {
          return item.name === val
        })
        console.log(obj.id)
        this.options.query.hospitalId = obj.id
        this.hospitalCodeFlag = false
      }
    },
    // 点击上传按钮(上传原始文件)
    uploadOrigin(item) {
      console.log(item)
      this.dialogStatus = "origin";
      this.dialogVisible = true
      // 显示弹框主体上传部分
      this.modelFlag = true
      // 上传参数设置(医生点击链接进来的情况)
      if (this.doctorFlag) {
        // this.options.query.orderId = this.orderId
        this.options.query.id = this.workId
        this.options.query.type = 0
      } else {
        this.options.query.type = 0
        this.options.query.id = item.id
      }
      this.showDataList= false
      this.pictureFlag = false
      this.clearFlag=true
    },
    // 点击列表中的上传模型按钮
    uploadModel(row) {
      // 确定上传模型需要传什么参数
      this.options.query.type = 1
      // this.options.query.hospitalCode=row.hospitalId
      this.options.query.id= row.id
      this.dialogVisible = true
      this.dialogStatus = 'model'
      this.modelFlag = true
      this.pictureFlag = false
      this.showDataList = false
      this.clearFlag = true
    },
    // 点击列表中的管理图片按钮
    uploadManagement(row) {
      // 重新获取列表?
      this.captureWork(this.params)
      this.modelFlag = false
      this.pictureFlag = true
      this.dialogVisible = true
      this.dialogStatus = 'picture'
      this.randomlyId = row.id
      // 根据row的images数组重组数组
      // let imagesArr = row.images
      let imagesArr = row.snapshot
      let list = imagesArr != null && imagesArr.length > 0 ? imagesArr : []
      let newList = new Array()
      list.forEach(item => {
        const obj = {}
        obj.selectFlag = false
        obj.img = item
        newList.push(obj)
      })
      this.srcList = newList
    },
    // 点击列表中的完成工单按钮
    uploadWork(row) {
      this.$confirm('确定要提交工单吗？', '提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.putRequest(`/work/${row.id}`)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                // this.disabledFlag = true
                this.$message.success('提交成功！')
              } else {
                this.$message.error(res.message)
              }
              this.$forceUpdate()
              this.captureWork(this.params)
            })
        })
        .catch(() => {
          console.log('已取消')
        })
    },
    // 点击文件列表下面的折叠按钮事件
    fileListShow() {
      let $list = $("#global-uploader .file-list");
      if ($list.is(":visible")) {
        $list.slideUp();
        this.collapse = true;
      } else {
        $list.slideDown();
        this.collapse = false;
      }
      console.log($("#global-uploader .file-list"))
    },
    // 上传组件绑定添加文件事件
    onFileAdded(file) {
      // 不清除
      this.clearFlag = false
      // 显示出文件列表ul
      this.showDataList = true
      let suffix = ''
      const type = file.fileType

      const index = file.relativePath.lastIndexOf('.')
      if (index >= 1) {
        // 获取文件后缀名
        suffix = file.relativePath.substr(index)
        console.log(suffix)
      }
      // 判断文件后缀为.zip 文件格式
      if(suffix==='.zip'||type==='application/zip'){
        // 文件格式正确，显示出上传区域
        this.panelShow = true;
        //计算MD5
        this.computeMD5(file);
      }else{
        this.$message.error('上传文件的格式不正确请上传.zip格式')
      }
    },
    closeWindow() {
      if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
          window.opener = null;
          window.close();
        } else {
          window.open('', '_top');
          window.top.close();
        }
      }else if (navigator.userAgent.indexOf("Firefox") > 0) {
        window.location.href = 'about:blank ';
      } else {
        window.opener = null;
        window.open('', '_self');
        window.close();
      }
    },
    // 文件上传成功后
    onFileSuccess(rootFile, file, response, chunk) {
      const that = this
      console.log('上传成功')
      console.log(chunk);
      console.log(response)
      let res = JSON.parse(response);
      console.log(res)
      if (res.code === 200) {
        this.$message({
          message: '上传成功',
          type: 'success',
          duration: 1500
        })
        this.messageShow = true
        // 如果不是医生跳转进来的就拉工单
        !this.doctorFlag && this.captureWork(this.params)
        this.doctorFlag && (setTimeout(function () {
          that.closeWindow()
        }, 1500))
      } else {
        this.$message({
          message: res.message,
          type: 'error',
          duration: 1500
        })
        this.statusSet(file.id, 'failed')
      }
      this.panelShow = false
      this.cancelEvent()
    },
    // 文件进度的回调
    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      );
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
    /* ===================================   事件回调  ================================= */
    
    // 计算添加文件的MD5
    computeMD5(file) {
      
      let fileReader = new FileReader();
      let time = new Date().getTime(); 
      // 获取兼容的文件切割api
      let blobSlice =
          File.prototype.slice ||
          File.prototype.mozSlice ||
          File.prototype.webkitSlice
      // 当前文件块
      let currentChunk = 0
      // 切割单位
      const chunkSize = 10 * 1024 * 1000;
      // 切割的文件总块数
      let chunks = Math.ceil(file.size / chunkSize);
      // 文件缓存器
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
        // MD5计算结束
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
      // 按切割单位计算当前下一个文件块大小读取到内存中
      function loadNext() {
      let start = currentChunk * chunkSize;
      let end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },
    // 计算MD5中回调，修改dom显示文件进度状态
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
      }
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
    // 文件MD5计算结束成功回调
    computeMD5Success(md5, file) {
      file.uniqueIdentifier = md5;
      // 发送请求预检文件
      this.getRequest(`/file/breakPoint?identifier=${md5}`).then((res) => {
        console.log(res)
        if (res.code != 20000) {
          console.log(res.message);
        }
        file.resume();
      });
      this.statusRemove(file.id);
    },
    // 文件MD5计算完毕后，修改dom状态
    statusRemove(id) {
      this.$nextTick(() => {
        // console.log("移除id");
        $(`.myStatus_${id}`).remove();
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.bg_bottom {
  margin-bottom: 20px;
}
.header {
  width: 100%;
  height: 60px;
  background: rgb(36, 36, 36);
  border-bottom: 1px solid #ccc;
}
.screenpix {
  width:80%;
  height:calc(100% - 120px);
  height:-webkit-calc(100% - 120px);
  height:-moz-calc(100% - 120px);
  height:-ms-calc(100% - 120px);
  height:-o-calc(100% - 120px);
  margin:50px auto 20px auto;
}
.button_space {
  margin: 10px auto;
}
.text_space{
  margin-top:0;
  color: #ff4040;
  font-weight: bold;
}
// 上传弹框上传主体部分
#global-uploader {
  min-height: 100px;
  position: relative;
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
}

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
.select_picture {
  height: 400px;
  border: 1px solid #eee;
  overflow-y: scroll;
  .select_pic_box {
    height: auto;
    min-height: 400px;
  }
  ul {
    list-style: none;
    padding: 0;
    li {
      display: inline-block;
      border: 1px solid #ddd;
      padding: 4px;
      margin: 5px;
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 5px;
      image {
        width: 100px;
        height: 100px;
      }
      .i_round, .i_round_fill {
        position: absolute;
        top: 3px;
        left: 3px;
        border-radius: 50%;
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
.empty{
  text-align: center;
  margin: 0 auto;
  position: absolute;
  width: 100%;
}
.message-container {
  width: 100%;
  height: 200px;
  line-height: 200px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  border: 1px dashed #ccc;
  color: #ccc;
  border-radius: 10px;
}
.action-btn-group {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
</style>