import http from '../http'
// 
/**
 *  @parms resquest 请求地址 例如：http://197.82.15.15:8088/request/...
 *  @param '/api'代表vue-cil中config，index.js中配置的代理
 */
let resquest = "/api/request/"

// get请求
export default {
    getListAPI(params) {
        return http.get(`${resquest}/getList.json`, params)
    },
    postFormAPI(params) {
        return http.post(`${resquest}/postForm.json`, params)
    }
}