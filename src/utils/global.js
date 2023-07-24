// 基本地址
export const baseUrl= 'https://dicom.ll3d.com/api/' //'https://dicom.ll3d.com/api/'

export const globalUrl = 'http://192.168.1.104:20001/'

export const modelUrl = 'https://png-1304836373.cos.ap-guangzhou.myqcloud.com/'
// 'http://192.168.1.104:20001/'
// https://dicom.ll3d.com/api/
export const imgUrl=baseUrl+'file/native/png?path=' //图片预览地址

export const globalImgUrl = globalUrl  + 'file/native/png?path='
// 上传图片配置
export const FileSet={
    uploadFile:baseUrl+'file/fileUpload', //上传原始数据以及模型文件地址
    uploadFileDicom:baseUrl+'file/order',
    chunkSize: "20480000", //10000*1024*2 上传文件大小
    maxChunkRetries: 5, //并发
    // 新的医学影像的设置
    globalUploadFile: globalUrl + 'file/upload'
}

export let statusArr = [
    {
        value: 10,
        label: '待上传'
    },
    {
        value: 20,
        label: '待制作'
    }
]

export let size = 5
export default{
    imgUrl,
    globalImgUrl,
    FileSet,
    baseUrl,
    modelUrl
}
