<template>
  <div class="wrap">
    <!-- 课程详情 -->
    <div class="main">
      <img class="topImg" @touchmove.prevent :src="classArray.image" alt />
      <div class="btn" @touchmove.prevent>
        <span
          v-for="(item, index) in topList"
          :key="index"
          :class="index+1 == idxtro ? 'actintro' : ''"
          @click="Submit(index+1)"
        >{{item}}</span>
      </div>

      <div class="page">
        <div class="page1" id="page1" v-html="classArray.content"></div>
        <div class="page1" id="page2" v-html="classArray.detail"></div>
        <div class="page1" id="page3" v-html="classArray.comment"></div>
        <div class="page1" id="page4" v-html="classArray.worklist"></div>
      </div>

      <div class="blockDiv"></div>

      <div class="settlement">
        <span class="settlementBtn" @click="goSettlementBtn">去结算</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from "mint-ui";
// import { MessageBox } from 'mint-ui';
import QRCode from "qrcode";
import html2canvas from "html2canvas";
export default {
  data() {
    return {
      commodityId: "", //商品id
      token: "", //token
      topList: ["课程介绍", "课程亮点", "家长好评", "作品展示"],
      idxtro: 1,

      classArray: {}, //课程信息
      isApp: "", //为1从app跳转进入
    };
  },
  mounted() {
    var _this = this;
    this.arrDom = document.getElementsByClassName("page1");
    window.addEventListener("scroll", this.handleScroll);

    window["getToken"] = function getToken(token) {
      _this.token = token;
      _this.$router.push({
        path: "/payment",
        query: {
          token: token,
          commodityId: _this.classArray.commodity_id,
        },
      });
    };

    // console.log(window,'1111')

    // var u = navigator.userAgent,
    //   app = navigator.appVersion;
    // var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
    // var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    // if (isAndroid) {
    //   function getToken(token) {
    //     _this.token = token;
    //     _this.$router.push({
    //       path: "/payment",
    //       query: {
    //         token: token,
    //         commodityId: _this.classArray.commodity_id,
    //       },
    //     });
    //   }
    // }
    // if (isIOS) {
    //   window["getToken"] = function getToken(token) {
    //     _this.token = token;
    //     _this.$router.push({
    //       path: "/payment",
    //       query: {
    //         token: token,
    //         commodityId: _this.classArray.commodity_id,
    //       },
    //     });
    //   };
    // }
  },

  methods: {
    //课程详情
    async imgArray() {
      await this.$axios
        .post(
          "/comm/comm/course_detail_h5",
          this.$qs.stringify({
            token: this.token,
            commodity_id: this.commodityId,
            terminal: 2,
          }),
          {
            emulateJSON: true,
          },
          {
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((res) => {
          // console.log(res);
          this.classArray = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 点击tab触发按钮高亮并滚动
    Submit(key) {
      this.idxtro = key;
      var PageId = document.querySelector("#page" + key);
      // 打印出对应页面与窗口的距离
      // console.log(PageId.offsetTop);
      // 使用平滑属性，滑动到上方获取的距离
      // 下方我只设置了top，当然 你也可以加上 left 让他横向滑动
      // widow 根据浏览器滚动条，如果你是要在某个盒子里面产生滑动，记得修改
      window.scrollTo({
        top: PageId.offsetTop - Number(260),
        behavior: "smooth",
      });
    },

    //滚动页面 tab高亮
    handleScroll() {
      let scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      this.headerFixed = scrollTop > this.offsetTop;
      for (let i = 0; i < this.arrDom.length; i++) {
        //因为下面使用到了i+1，所以需要把最后一个分离出来判断
        if (this.arrDom[this.arrDom.length - 1].offsetTop - scrollTop > 260) {
          if (
            this.arrDom[i].offsetTop - scrollTop <= 260 &&
            this.arrDom[i + 1].offsetTop - scrollTop > 260
          ) {
            this.idxtro = i + 1;
          }
        } else {
          this.idxtro = this.arrDom.length;
        }
      }
    },

    //去结算
    goSettlementBtn() {
      // console.log("去结算");
      // console.log(this.isApp, "---------------is_app");
      if (this.isApp == "1") {
        //is_app为1从app跳转进入 点击进入app登录页
        var u = navigator.userAgent,
          app = navigator.appVersion;
        var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (isAndroid) {
          // console.log(isAndroid, "--------------------isAndroid");
          window.injectedObject.checkLogin();
        }
        if (isIOS) {
          // console.log(isIOS, "--------------------isIOS");
          window.webkit.messageHandlers.notice.postMessage({
            action: "login",
          });
          // window.webkit.messageHandlers.getToken.postMessage("token");
        }
      } else {
        //is_app不为1从浏览器跳转进入 点击进入h5登录页
        var loginFlag = this.classArray.is_bind_mobile; //0 未绑定手机号 1绑定手机号
        var payFlag = this.classArray.pay_status; //0 无待支付订单 1不可点击下一步，有待支付订单
        if (loginFlag == "1") {
          if (payFlag == "0") {
            this.$router.push({
              path: "/payment",
              query: {
                token: this.token,
                commodityId: this.classArray.commodity_id,
              },
            });
          } else {
            Toast({
              message: "有待支付订单",
              duration: 2000,
            });
          }
        } else {
          this.$router.push({
            path: "/login",
            query: {
              token: this.token,
            },
          });
        }
      }
    },
  },
  async created() {
    var url = window.location.href;
    let urlHref = url.split("?")[1]; //分割url
    if (urlHref.split("&")[1]) {
      let arr = urlHref.split("&"); //url转数组
      // console.log(arr, "154");
      let commodityId = arr[0].substr(arr[0].indexOf("=") + 1); //截取下标为0的值 课程id
      let token = urlHref.split("&")[1].split("=")[1]; //截取下标为1的值 token
      let isApp = arr[2].substr(arr[2].indexOf("=") + 1);
      // console.log(commodityId, token, "157");
      this.token = token;
      this.commodityId = commodityId;
      this.isApp = isApp;
      // console.log(isApp,'------isApp')
    } else {
      // let arr = urlHref.split("&"); //url转数组
      let commodityId = urlHref.substr(urlHref.indexOf("=") + 1); //截取下标为0的值 课程id
      // let commodityId = arr[0].substr(arr[0].indexOf("=") + 1); //截取下标为0的值 课程id
      this.commodityId = commodityId;
    }

    await this.imgArray();

    // console.log(navigator, "---------------161");

    // setTimeout(() => {
    //   this.imgArray();
    // }, 500);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: 100%;
  user-select: none;
}

.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .topImg {
    width: 100%;
    height: 200px;
    position: fixed;
    display: block;
    top: 0;
    left: 0;
    background: #fff;
  }
}

.btn {
  width: 100%;
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  box-sizing: border-box;
  border-bottom: 1px solid #e8e8e8;
  position: fixed;
  top: 200px;
  left: 0;
}

.page {
  width: 100%;
  margin-top: 260px;
}

.page div {
  width: 100%;
  // height: 500px;
}

.actintro {
  color: #5eb4bc;
  position: relative;
  &:after {
    content: " ";
    width: 20px;
    height: 3px;
    border-radius: 10px;
    background: #5eb4bc;
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%); //居中
  }
}

.blockDiv {
  width: 100%;
  height: 60px;
}

.settlement {
  width: 100%;
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
}

.settlement .settlementBtn {
  width: 90%;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #db4f42;
  color: #fff;
  border-radius: 10px;
}
</style>
