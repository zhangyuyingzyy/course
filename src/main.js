// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import qs from 'qs'

import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'


// import Vconsole from 'vconsole';
// new Vconsole();

// import { AddressEdit } from 'vant';
import 'vant/lib/index.css'
// Vue.use(AddressEdit); //新增地址 vant框架

import { Area } from 'vant';
Vue.use(Area);

// import apiConfig from '../config/api.config.js'
// axios.defaults.baseURL = apiConfig.baseURL



Vue.config.productionTip = false

Vue.prototype.$axios = axios.create({
    baseURL: '/api'
})

// Vue.prototype.$axios = axios

Vue.prototype.$qs = qs

Vue.use(MintUI)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})