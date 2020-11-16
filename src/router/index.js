import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'
import Course from '@/views/Course'
import Payment from '@/views/Payment'
import Addressmanage from '@/views/Addressmanage'
import Address from '@/views/Address'
import Login from '@/views/Login'
import Paymentsuccess from '@/views/Paymentsuccess'
import Shoppayment from '@/views/Shoppayment'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    routes: [{
        path: '/',
        name: 'Course',
        component: Course,
        meta: {
            title: '课程详情'
        }
    }, {
        path: '/payment',
        name: 'Payment',
        component: Payment,
        meta: {
            title: '待支付订单'
        }
    }, {
        path: '/addressmanage',
        name: 'Addressmanage',
        component: Addressmanage,
        meta: {
            title: '地址管理'
        }
    }, {
        path: '/address',
        name: 'Address',
        component: Address,
        meta: {
            title: '添加收货地址'
        }
    }, {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            title: '登录注册'
        }
    }, {
        path: '/paymentsuccess',
        name: 'Paymentsuccess',
        component: Paymentsuccess,
        meta: {
            title: '支付成功'
        }
    }, {
        path: '/shoppayment',
        name: 'Shoppayment',
        component: Shoppayment,
        meta: {
            title: '待支付订单'
        }
    }]
})