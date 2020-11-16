<template>
  <div class="box" @click.capture="boxBlock">
    <div class="wrap">
      <!-- 商城-待支付订单 -->
      <div class="addressDiv" @click="goAddress">
        <div class="topAddress" v-if="addressFlag">
          <p class="titAdd">添加地址</p>
          <img class="goAddress" src="../../static/moreRight.png" alt />
        </div>
        <div class="topAddress" v-if="addressFlag1">
          <p class="messageLeft">
            <span class="citySpan">{{changeAddress.city}}{{changeAddress.address}}</span>
            <span class="nameList">
              <span>{{changeAddress.name}}</span>
              <span>{{changeAddress.mobile}}</span>
            </span>
          </p>
          <img class="goAddress" src="../../static/moreRight.png" alt />
        </div>
      </div>

      <div class="buyMessage">
        <p class="classTit">购买信息</p>
        <div class="classMessage">
          <p class="className">{{paymentArray.name}}</p>
          <p class="classPrice">
            <span class="priceSum">¥{{paymentArray.sell_price}}</span>
            <span class="priceNum">x{{paymentArray.count}}</span>
          </p>
        </div>
      </div>
      <div class="buyMediums">

        <!-- 支付方式 -->
        <div class="payMethodDiv">
          <p class="payTit">支付方式</p>
          <div class="payDiv">
            <!-- <section class="selectPay"> -->
            <ul class="payBox" id="payBox">
              <li
                class="payWay"
                v-for="(item,index) in paymentArray.pay_method"
                :key="index"
                @click="payMethod(index,item.name)"
              >
                <p class="payLeft">
                  <img class="payIcon" v-if="item.type=='1'" src="../../static/weChatIcon.png" alt />
                  <img class="payIcon" v-if="item.type=='2'" src="../../static/alipayIcon.png" alt />
                  <img class="payIcon" v-if="item.type=='4'" src="../../static/balanceIcon.png" alt />
                  <span>{{item.name}}</span>
                </p>
                <p class="chooseIcon" :class="payIndex==index?'payActive':''"></p>
              </li>
            </ul>
            <!-- </section> -->
          </div>
        </div>
        <div class="blockDiv"></div>
      </div>
      <!-- 去支付 -->
      <div class="settlement">
        <p class="priceLeft">
          <span class="paySum">合计：¥{{orderPrice}}</span>
          <span class="surplusNum" v-if="editVal && goPayFalge">剩余余额：¥{{paymentArray.money}}</span>
        </p>
        <span class="settlementBtn" @click="goPayBtn" v-if="editVal && noRecharge">去支付</span>
        <span class="settlementBtn" @click="goRecharge" v-if="editVal && rechargeFlag">去充值</span>
        <span class="delBtn" @click="delBtn" v-if="completeVal">删除</span>
      </div>

      <!-- 优惠券弹框 -->
      <div class="maskBox" v-if="maskShow">
        <div class="maskContent">
          <h3>领取优惠券</h3>
          <div class="conponArray">
            <div class="couponList" v-for="(item,index) in couponArray" :key="index">
              <span class="priceNow">¥{{item.discount}}</span>
              <p class="centerCon">
                <span>满{{item.price}}可用</span>
                <span>{{item.starttime}}-{{item.endtime}}</span>
                <span v-if="item.is_all=='0'">全平台适用</span>
                <span v-if="item.is_all=='1'">部分产品适用</span>
              </p>
              <p class="goGet" v-if="item.is_user=='0'" @click="getCouponBtn(index)">去领取</p>
              <p
                class="goGet"
                v-if="item.is_user=='1' && item.is_order=='0'"
                @click="useCouponBtn(index)"
              >去使用</p>
              <p class="goGet" v-if="item.is_order=='1'">已使用</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast, MessageBox, Indicator } from "mint-ui";
import wx from "weixin-js-sdk";
export default {
  data() {
    return {
      token: "",
      commodityId: "", //商品id
      paymentArray: {}, //待支付页面数据
      couponArray: [], //选择优惠券数组
      usediscountId: 0, //点击使用优惠券id
      couponPrice: "0", //优惠金额
      countArr: [], //修改画材
      couponBoxFlag: false, //优惠券显示
      couponBoxFlag1: Boolean, //优惠券显示
      showNoFlag: Boolean,
      payIndex: 0, //支付方式 默认选中第一个
      nameIndex: -1, //选择画材 默认不选中
      isBlanced: false, //用于取消选中
      editVal: true, //管理按钮
      completeVal: false, //完成按钮
      rechargeFlag: false, //余额支付时展示去充值 1需要充值 0不需要充值展示去支付
      goPayFalge: false, //余额支付时 展示剩余余额
      noRecharge: true, //余额支付时不展示去支付
      changeAddress: {}, //选择地址
      addressFlag: Boolean, //是否有地址
      addressFlag1: Boolean, //是否有地址
      useMethod: "0", //1使用余额支付 0不使用
      orderPrice: "", //合计
      paintingArr: [], //多选画材新数组
      paintsFlag: Boolean, //画材包为空时不展示画材包列表
      checkPaintingArr: [], //选中删除画材包新数组
      payMethodFlag: "1", //1 微信 2支付宝 3余额支付

      maskShow: false, //优惠券弹框

      isIos: false,
      isAndroid: false,
      schemeUrl: "",
      downloadUrl: "",

      alipayWap: "",

      orderCode: "",

      isPay: "",

      addressId: "", //选择地址id
    };
  },
  mounted() {},
  methods: {
    //支付宝支付
    //支付宝浏览器支付
    ready(callback) {
      // 如果jsbridge已经注入则直接调用
      if (window.AlipayJSBridge) {
        callback && callback();
      } else {
        // 如果没有注入则监听注入的事件
        document.addEventListener("AlipayJSBridgeReady", callback, false);
      }
    },

    alipayApp(orderStr, callback) {
      // console.log(orderStr, "zxcvn");
      this.ready(() => {
        AlipayJSBridge.call(
          "tradePay",
          {
            orderStr: orderStr,
          },
          (result) => {
            callback(result);
          }
        );
      });
    },

    //点击任意地方取消优惠券弹框
    boxBlock() {
      if (!event.target.closest(".maskContent")) {
        this.maskShow = false;
        document.body.style.overflow = ""; //出现滚动条
      }
    },
    //添加地址
    goAddress() {
      this.$router.push({
        path: "/addressmanage",
        query: {
          token: this.token,
        },
      });
    },

    //管理
    editBtn() {
      this.editVal = false;
      this.completeVal = true;
    },

    //完成
    completeBtn() {
      this.editVal = true;
      this.completeVal = false;
      // console.log(this.addressId, "-------------this.addressId");
      this.$axios
        .post(
          "/comm/comm/order_confirm",
          this.$qs.stringify({
            token: this.token,
            commodity_id: this.commodityId,
            discount_id: this.usediscountId,
            paints: JSON.stringify(this.countArr),
            terminal: 2,
            version: "",
            address_id: this.addressId,
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
          this.orderPrice = res.data.data.order_price;
          // this.paymentArray = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    //++
    addSumBtn(addInd) {
      if (
        this.paymentArray.paints[addInd].count <
        this.paymentArray.paints[addInd].limit_count
      ) {
        this.paymentArray.paints[addInd].count++;
        // console.log(this.countArr, "-----------------++235");
        this.countArr = this.countArr.concat(this.paymentArray.paints[addInd]);
        // console.log(this.countArr, "-----------------++237");
        let addArr1 = this.countArr.map((item) => item.id);
        let newArr = Array.from(new Set(addArr1));
        // console.log(addArr1, newArr, "新数组");
        if (newArr.length < addArr1.length) {
          //在这里面做你想做的操作
          // console.log("含有重复的数字");
          // console.log(addInd, this.countArr[addInd], "--------------jia");
          this.countArr.splice(addInd, 1, this.countArr[addInd]);
          this.countArr.pop();
          // for(var i = 0;i<this.countArr.length;i++) {
          //   for(var j = i+1; j<this.countArr.length;j++) {
          //     if(this.countArr[i] == this.countArr[j]) {
          //       this.countArr.splice(j,1)
          //       j--
          //     }
          //   }
          // }
        } else {
          // console.log('没有重复')
        }
        // console.log(this.countArr, "zzz");
        // console.log(this.paymentArray.paints[addInd]);
      }
    },

    //--
    cutSumBtn(cutInd) {
      if (
        this.paymentArray.paints[cutInd].count >
        this.paymentArray.paints[cutInd].start_count
      ) {
        this.paymentArray.paints[cutInd].count--;
        this.countArr = this.countArr.concat(this.paymentArray.paints[cutInd]);
        let addArr1 = this.countArr.map((item) => item.id);
        let newArr = Array.from(new Set(addArr1));
        // console.log(addArr1, newArr, "新数组");
        if (newArr.length < addArr1.length) {
          //在这里面做你想做的操作
          // console.log("含有重复的数字");
          this.countArr.splice(cutInd, 1, this.countArr[cutInd]);
          this.countArr.pop();
          // for(var i = 0;i<this.countArr.length;i++) {
          //   for(var j = i+1; j<this.countArr.length;j++) {
          //     if(this.countArr[i] == this.countArr[j]) {
          //       this.countArr.splice(j,1)
          //       j--
          //     }
          //   }
          // }
        } else {
          // console.log('没有重复')
        }
      }
    },

    //优惠券
    couponBtn() {
      this.maskShow = true;
      document.body.style.overflow = "hidden"; //禁止页面划动
    },

    //领取优惠券
    getCouponBtn(getInd) {
      // console.log(this.couponArray[getInd].id);
      let discountId = this.couponArray[getInd].id;
      this.$axios
        .post(
          "/home/index/get_discount",
          this.$qs.stringify({
            token: this.token,
            discount_id: discountId,
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
          if (res.data.code == "200") {
            Toast({
              message: "领取成功",
              duration: 2000,
            });
            var couponArray = this.data.couponArray[getInd];
            couponArray.is_user = couponArray.is_user == 1 ? 0 : 1;
          } else {
            Toast({
              message: res.data.msg,
              duration: 2000,
            });
          }
          // console.log(res.data);
          // this.paymentArray = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    //使用优惠券
    useCouponBtn(useInd) {
      // console.log(this.couponArray[useInd], "shiyong");
      // console.log(this.couponArray[useInd].id);
      this.usediscountId = this.couponArray[useInd].id;
      this.payArray();
      this.couponPrice = this.couponArray[useInd].discount; //优惠金额
      this.couponBoxFlag = true;
      this.couponBoxFlag1 = false;
      this.maskShow = false;
    },

    //选择支付方式
    payMethod(index, item) {
      // this.isBlanced = !this.isBlanced;
      let rechargeStatus = this.paymentArray.recharge_status; //1需要充值 0不需要充值
      this.payIndex = index;
      if (item == "余额支付") {
        this.useMethod = "1"; //1使用余额支付 0不使用
        this.payMethodFlag = "3"; //余额支付
        this.goPayFalge = true;
        if (rechargeStatus == "1") {
          this.rechargeFlag = true;
          this.noRecharge = false;
        } else {
          this.rechargeFlag = false;
          this.noRecharge = true;
        }
      } else if (item == "微信支付") {
        this.useMethod = "0"; //1使用余额支付 0不使用
        this.payMethodFlag = "1"; //微信支付
        this.rechargeFlag = false;
        this.noRecharge = true;
        this.goPayFalge = false;
      } else if (item == "支付宝支付") {
        this.useMethod = "0"; //1使用余额支付 0不使用
        this.payMethodFlag = "2"; //支付宝支付
        this.rechargeFlag = false;
        this.noRecharge = true;
        this.goPayFalge = false;
      }

      // if (this.payIndex == index) {
      //   if (!this.isBlanced) {
      //     this.payIndex = -1;
      //   } else {
      //     this.payIndex = index;
      //   }
      // } else {
      //   this.payIndex = index;
      // }
    },

    //选择删除画材
    nameMethod(key, nameInd) {
      // console.log(this.paintingArr.includes(nameInd));

      if (this.paintingArr.includes(nameInd)) {
        //includes()方法判断是否包含某一元素,返回true或false表示是否包含元素，对NaN一样有效
        //filter()方法用于把Array的某些元素过滤掉，filter()把传入的函数依次作用于每个元素，然后根据返回值是true还是false决定保留还是丢弃该元素：生成新的数组
        // this.paintingArr=this.paintingArr.filter(function (ele){return ele != nameInd;});
        // console.log(this.paintingArr,'------------------选中')
        this.paintingArr = this.paintingArr.filter((ele) => ele != nameInd);
        this.checkPaintingArr = this.checkPaintingArr.filter(
          (ele) => ele != key
        );
        //filter()为假时删除
      } else {
        this.paintingArr.push(nameInd);
        this.checkPaintingArr = this.checkPaintingArr.concat(key);
        for (var i = 0; i < this.checkPaintingArr.length; i++) {
          for (var j = i + 1; j < this.checkPaintingArr.length; j++) {
            if (this.checkPaintingArr[i] == this.checkPaintingArr[j]) {
              this.checkPaintingArr.splice(j, 1);
              j--;
            }
          }
        }
      }
      // console.log(this.checkPaintingArr, "------------选中删除新222");
    },

    //判断是否支付成功
    isPayArray() {
      this.$axios
        .post(
          "/order/new_order/is_pay",
          this.$qs.stringify({
            token: this.token,
            ordercode: this.orderCode,
            pay_method: this.payMethodFlag,
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
          this.isPay = res.data.data.is_pay;
          if (res.data.data.is_pay == "1") {
            //is_pay 1已支付 0未支付
            this.showFlag = true;
            this.showFlag1 = false;
          } else {
            this.showFlag = false;
            this.showFlag1 = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    //支付成功后题爱转成功页面
    paySuccessF() {
      if (this.isPay == "1") {
        clearInterval(this.timer);
        this.$router.push({
          path: "/paymentsuccess",
          query: {
            token: this.token,
            orderCode: this.orderCode,
            payMethodFlag: this.payMethodFlag,
          },
        });
      } else {
        this.timer = setInterval(() => {
          this.isPayArray();
          if (this.isPay == "1") {
            clearInterval(this.timer);
            this.$router.push({
              path: "/paymentsuccess",
              query: {
                token: this.token,
                orderCode: this.orderCode,
                payMethodFlag: this.payMethodFlag,
              },
            });
          }
        }, 1000);
      }
    },

    //去支付
    goPayBtn() {
      let payStatus = this.paymentArray.pay_status; //0 无待支付订单 1有待支付订单，不可点击下一步
      if (payStatus == "0") {
        if (this.changeAddress.length == "0") {
          Toast({
            message: "请选择收货地址",
            duration: 2000,
          });
        } else {
          this.$axios
            .post(
              "/order/new_order/go_pay",
              this.$qs.stringify({
                token: this.token,
                commodity_id: this.commodityId,
                name: this.changeAddress.name,
                mobile: this.changeAddress.mobile,
                city: this.changeAddress.city,
                address: this.changeAddress.address,
                discount_id: this.usediscountId,
                paints: JSON.stringify(this.countArr),
                terminal: 2,
                use_money: this.useMethod,
                pay_method: this.payMethodFlag,
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
              // console.log(res.data, "--------------支付方式");
              if (res.data.code == "200") {
                this.orderCode = res.data.data.ordercode;
                if (this.payMethodFlag == "1") {
                  //微信支付
                  // window.location.href = res.data.data.mweb_url;
                  var u = navigator.userAgent,
                    app = navigator.appVersion;
                  var isAndroid =
                    u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
                  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                  if (isAndroid) {
                    window.injectedObject.openToPay(res.data.data.mweb_url);
                  }
                  if (isIOS) {
                    window.webkit.messageHandlers.notice.postMessage({
                      action: "weixinPay",
                      payUrl: res.data.data.mweb_url,
                    });
                  }

                  this.paySuccessF();

                  // setTimeout(() => {
                  //   MessageBox({
                  //     title: "请确认支付是否已完成",
                  //     message: "",
                  //     confirmButtonText: "已完成支付",
                  //     cancelButtonText: "重新支付",
                  //     showCancelButton: true,
                  //   }).then((action) => {
                  //     if (action == "confirm") {
                  //       //确认的回调
                  //       this.$router.push({
                  //         path: "/paymentsuccess",
                  //         query: {
                  //           token: this.token,
                  //           orderCode: res.data.data.ordercode,
                  //           payMethodFlag: this.payMethodFlag,
                  //         },
                  //       });
                  //     }
                  //   });
                  // }, 1000);
                  // console.log(this.isPay, "-----------this.isPay");
                } else if (this.payMethodFlag == "2") {
                  //支付宝支付
                  // this.alipayApp(res.data, (result) => {
                  //   //支付结果判断和跳转
                  //   console.log('aaaaaasssss')
                  // });
                  // console.log(res.data.data.ios_alipay_url)
                  var u = navigator.userAgent,
                    app = navigator.appVersion;
                  var isAndroid =
                    u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
                  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                  if (isAndroid) {
                    // window.location.href = res.data.data.android_alipay_url;
                    window.injectedObject.openToPay(
                      res.data.data.android_alipay_url
                    );
                    this.paySuccessF();

                    // if (this.isPay == "1") {
                    //   clearInterval(this.timer);
                    //   this.$router.push({
                    //     path: "/paymentsuccess",
                    //     query: {
                    //       token: this.token,
                    //       orderCode: res.data.data.ordercode,
                    //       payMethodFlag: this.payMethodFlag,
                    //     },
                    //   });
                    // } else {
                    //   this.timer = setInterval(() => {
                    //     this.isPayArray();
                    //     if (this.isPay == "1") {
                    //       clearInterval(this.timer);
                    //       this.$router.push({
                    //         path: "/paymentsuccess",
                    //         query: {
                    //           token: this.token,
                    //           orderCode: res.data.data.ordercode,
                    //           payMethodFlag: this.payMethodFlag,
                    //         },
                    //       });
                    //     }
                    //   }, 1000);
                    // }
                  }
                  if (isIOS) {
                    // window.location.href = res.data.data.ios_alipay_url;

                    window.webkit.messageHandlers.notice.postMessage({
                      action: "alipayPay",
                      payUrl: res.data.data.ios_alipay_url,
                    });
                    this.paySuccessF();
                    // if (this.isPay == "1") {
                    //   clearInterval(this.timer);
                    //   this.$router.push({
                    //     path: "/paymentsuccess",
                    //     query: {
                    //       token: this.token,
                    //       orderCode: res.data.data.ordercode,
                    //       payMethodFlag: this.payMethodFlag,
                    //     },
                    //   });
                    // } else {
                    //   this.timer = setInterval(() => {
                    //     this.isPayArray();
                    //     if (this.isPay == "1") {
                    //       clearInterval(this.timer);
                    //       this.$router.push({
                    //         path: "/paymentsuccess",
                    //         query: {
                    //           token: this.token,
                    //           orderCode: res.data.data.ordercode,
                    //           payMethodFlag: this.payMethodFlag,
                    //         },
                    //       });
                    //     }
                    //   }, 1000);
                    // }
                  }

                  // this.alipayWap = res.data;
                  // const div = document.createElement("div");
                  // div.setAttribute("id", "alipay-wap");
                  // div.innerHTML = res.data; //返回的表单
                  // document.body.appendChild(div);
                  // document.forms.alipaysubmit.submit();

                  // _this.alipayWap = _msg.content;
                  // let div = document.createElement('div');
                  // div.setAttribute('id', 'alipay-wap');
                  // /* 此处form就是后台返回接收到的数据 */
                  // div.innerHTML = _msg.content;
                  // document.body.appendChild(div);
                  // document.forms['alipay_submit'].submit();
                  // setTimeout(() => {
                  //   this.alipayWap = "";
                  //   document.getElementById("alipay-wap").remove(); // 拉起支付宝后移除dom
                  //   // $('#alipay-wap').remove(); // 拉起支付宝后移除dom
                  // }, 1000);
                } else if (this.payMethodFlag == "3") {
                  //余额支付

                  // Indicator.open({
                  //   text: "加载中...",
                  //   spinnerType: "fading-circle",
                  // });
                  // console.log(this.isPay, "----------------this.isPay");
                  this.paySuccessF();
                  // if (this.isPay == "1") {
                  //   // Indicator.close();
                  //   clearInterval(this.timer);
                  //   this.$router.push({
                  //     path: "/paymentsuccess",
                  //     query: {
                  //       token: this.token,
                  //       orderCode: res.data.data.ordercode,
                  //       payMethodFlag: this.payMethodFlag,
                  //     },
                  //   });
                  // } else {
                  //   this.timer = setInterval(() => {
                  //     this.isPayArray();
                  //     if (this.isPay == "1") {
                  //       clearInterval(this.timer);
                  //       this.$router.push({
                  //         path: "/paymentsuccess",
                  //         query: {
                  //           token: this.token,
                  //           orderCode: res.data.data.ordercode,
                  //           payMethodFlag: this.payMethodFlag,
                  //         },
                  //       });
                  //     }
                  //   }, 1000);
                  // }
                }
              } else {
                this.orderCode = res.data.data.ordercode;
                Toast({
                  message: res.data.msg,
                  duration: 2000,
                });
                this.paySuccessF();
                // if (this.isPay == "1") {
                //   // Indicator.close();
                //   clearInterval(this.timer);
                //   this.$router.push({
                //     path: "/paymentsuccess",
                //     query: {
                //       token: this.token,
                //       orderCode: res.data.data.ordercode,
                //       payMethodFlag: this.payMethodFlag,
                //     },
                //   });
                // } else {
                //   this.timer = setInterval(() => {
                //     this.isPayArray();
                //     if (this.isPay == "1") {
                //       clearInterval(this.timer);
                //       this.$router.push({
                //         path: "/paymentsuccess",
                //         query: {
                //           token: this.token,
                //           orderCode: res.data.data.ordercode,
                //           payMethodFlag: this.payMethodFlag,
                //         },
                //       });
                //     }
                //   }, 1000);
                // }
              }

              // console.log(res.data);
              // this.paymentArray = res.data.data;
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } else {
        Toast({
          message: "有待支付订单",
          duration: 2000,
        });
      }
    },

    //去充值
    goRecharge() {
      // window.open(url)
      var u = navigator.userAgent,
        app = navigator.appVersion;
      var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
      var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if (isAndroid) {
        // console.log(isAndroid, "--------------------isAndroid");
        window.injectedObject.notice({
          action: "recharge",
        });
      }
      if (isIOS) {
        // console.log(isIOS, "--------------------isIOS");
        window.webkit.messageHandlers.notice.postMessage({
          action: "recharge",
        });
      }
    },

    //删除
    delBtn() {
      // console.log(this.paintingArr, this.checkPaintingArr, "删除");
      if (this.checkPaintingArr.length == "") {
        Toast({
          message: "您还没有选择商品",
          duration: 2000,
        });
      } else {
        MessageBox({
          title: "提示",
          message: "确认删除吗？",
          showCancelButton: true,
        }).then((action) => {
          var newDate = [];
          this.paymentArray.paints.forEach((val, index) => {
            if (!(this.paintingArr.indexOf(index) > -1)) {
              // console.log(
              //   this.paintingArr.indexOf(index),
              //   "------------删除22222"
              // );
              newDate.push(val);
              var newCountPaint = [];
              newCountPaint = newCountPaint.concat(this.checkPaintingArr);
              newCountPaint.map((item, index) => {
                item.count = 0;
              });
              // console.log(newCountPaint, "509");
              this.countArr = this.countArr.concat(newCountPaint);
              for (var i = 0; i < this.countArr.length; i++) {
                for (var j = i + 1; j < this.countArr.length; j++) {
                  if (this.countArr[i] == this.countArr[j]) {
                    this.countArr.splice(j, 1);
                    j--;
                  }
                }
              }
              // console.log(this.countArr, "521");
              if (this.paintingArr.indexOf(index) == -1) {
                // console.log(val, "------------删除13333");
              }
            }
          });
          this.paymentArray.paints = newDate;
          this.paintingArr = [];
          // console.log(newDate, "------------删除1");
          if (this.paymentArray.paints.length == "") {
            this.paintsFlag = false;
          } else {
            this.paintsFlag = true;
          }
        });
      }
    },

    //待支付订单
    payArray() {
      let addressId = JSON.parse(localStorage.getItem("addressInfo") || "[]");
      this.addressId = addressId;
      this.$axios
        .post(
          "/comm/comm/order_confirm",
          this.$qs.stringify({
            token: this.token,
            commodity_id: this.commodityId,
            discount_id: this.usediscountId,
            terminal: 2,
            version: "",
            address_id: this.addressId,
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
          this.paymentArray = res.data.data;
          this.orderPrice = res.data.data.order_price;
          this.changeAddress = res.data.data.address;
          if (res.data.data.address.length == "") {
            this.addressFlag = true;
            this.addressFlag1 = false;
          } else {
            this.addressFlag = false;
            this.addressFlag1 = true;
          }
          if (res.data.code == "200") {
            if (res.data.data.paints.length == "") {
              this.paintsFlag = false;
            } else {
              this.countArr = this.countArr.concat(res.data.data.paints);
              this.paintsFlag = true;
            }
          } else {
            Toast({
              message: res.data.msg,
              duration: 2000,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    //课程适用优惠券
    discountArray() {
      this.$axios
        .post(
          "/comm/comm/commodity_discount",
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
          this.couponArray = res.data.data.list;
          if (res.data.data.list.length == "") {
            this.showNoFlag = false;
          } else {
            this.showNoFlag = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  created() {
    this.token = this.$route.query.token;
    this.commodityId = this.$route.query.commodityId;
    if (this.$route.query.token) {
      this.payArray(); //待支付订单接口
      this.discountArray(); //课程适用优惠券
    }

    let changeAddressArr = JSON.parse(
      localStorage.getItem("changeList") || "[]"
    );
    this.changeAddress = changeAddressArr;

    let addressId = JSON.parse(localStorage.getItem("addressInfo") || "[]");
    this.addressId = addressId;

    if (changeAddressArr.length == "") {
      this.addressFlag = true;
      this.addressFlag1 = false;
    } else {
      this.addressFlag = false;
      this.addressFlag1 = true;
    }
  },
  destroyed() {
    localStorage.removeItem("changeList");
    clearInterval(this.timer);
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
  background: #f5f2f2;
}

.wrap {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}
.addressDiv {
  padding: 20px 15px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 10px;
  .topAddress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .messageLeft {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .citySpan {
        font-size: 15px;
        font-weight: 500;
      }
      .nameList {
        margin-top: 10px;
        font-size: 13px;
        color: #999999;
      }
    }
    .titAdd {
      font-size: 18px;
      font-weight: 400;
    }
    .goAddress {
      width: 8px;
      height: 13px;
    }
  }
}

.buyMessage {
  display: flex;
  flex-direction: column;
  .classTit {
    margin: 20px 0;
    font-size: 20px;
    font-weight: bold;
  }
  .classMessage {
    display: flex;
    flex-direction: column;
    // align-items: center;
    justify-content: space-between;
    padding: 20px 15px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 10px;
    font-size: 18px;
    .classPrice {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      > .priceSum {
        color: #dd4715;
        font-size: 20px;
        font-weight: 500;
      }
      > .priceNum {
        font-size: 15px;
        color: #999;
      }
    }
  }
}

.buyMediums {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  .mediumsTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .mediumsTop > .editBtn,
  .mediumsTop > .completeBtn {
    color: #fff;
    background: #268893;
    border-radius: 20px;
    padding: 4px 25px;
    box-sizing: border-box;
  }
  .mediumsTop > .mediumsTit {
    margin: 20px 0;
    font-size: 20px;
    font-weight: bold;
  }
  .mediumsBox {
    padding: 0 15px 20px 15px;
    box-sizing: border-box;
    border-radius: 10px;
    background: #fff;
  }
  .mediumsDiv:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
  .mediumsDiv {
    display: flex;
    flex-direction: column;
    .nameTop {
      display: flex;
      align-items: center;
      .choosenameIcon {
        width: 15px;
        height: 15px;
        background: url(../../static/noselect2.png) no-repeat;
        background-size: 100%;
        margin-top: 20px;
        margin-right: 10px;
      }
      .choosenameIcon.nameActive {
        width: 15px;
        height: 15px;
        background: url(../../static/hasSelect1.png) no-repeat;
        background-size: 100%;
        margin-top: 20px;
        margin-right: 10px;
      }
      .mediumsName {
        margin-top: 20px;
      }
    }
    .mediumsPrice {
      // display: flex;
      // flex-direction: column;
      // align-items: center;
      .mediumsLeft {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        > .priceSum {
          color: #dd4715;
          font-size: 20px;
          font-weight: 500;
        }
        > .priceNum {
          font-size: 15px;
          color: #999;
        }
      }
      .sumDiv {
        display: flex;
        align-items: center;
        > span {
          width: 22px;
          height: 22px;
          text-align: center;
          line-height: 22px;
          background: #eeeeee;
          color: #333;
          font-size: 12px;
        }
        .editSum {
          width: 22px;
          height: 22px;
          text-align: center;
          line-height: 22px;
          background: #eeeeee;
          color: #333;
          font-size: 12px;
          border: none;
          border-radius: 0%;
          margin-left: 1px;
          margin-right: 1px;
        }
      }
    }
  }
  .couponDiv {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 20px 15px;
    box-sizing: border-box;
    border-radius: 10px;
    margin-top: 20px;
    .rightDiv {
      display: flex;
      align-items: center;
      > span {
        color: #666;
        font-size: 14px;
      }
      .rightBtn {
        width: 10px;
        height: 10px;
        margin-left: 10px;
      }
    }
  }
}

.payMethodDiv {
  display: flex;
  flex-direction: column;
  .payTit {
    margin: 20px 0;
    font-size: 20px;
    font-weight: bold;
  }
  .payDiv {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 0 15px;
    box-sizing: border-box;
    border-radius: 10px;
    .payBox {
      width: 100%;
      .payWay:not(:last-child) {
        border-bottom: 1px solid #eee;
      }
      .payWay {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 0;
        box-sizing: border-box;
        .payLeft {
          display: flex;
          align-items: center;
          .payIcon {
            width: 20px;
            height: 15px;
            margin-right: 10px;
          }
        }
        .chooseIcon {
          width: 20px;
          height: 20px;
          background: url(../../static/noselect2.png) no-repeat;
          background-size: 100%;
        }

        .chooseIcon.payActive {
          width: 20px;
          height: 20px;
          background: url(../../static/hasSelect1.png) no-repeat;
          background-size: 100%;
        }
      }
    }
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
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 10px 20px;
  box-sizing: border-box;
  .priceLeft {
    display: flex;
    flex-direction: column;
    .paySum {
      color: #dd4715;
      font-weight: 500;
      font-size: 18px;
    }
    .surplusNum {
      font-size: 14px;
      font-weight: 400;
    }
  }
  .settlementBtn,
  .delBtn {
    background: #db4f42;
    color: #fff;
    padding: 10px 40px;
    box-sizing: border-box;
    border-radius: 10px;
  }
}

.maskBox {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.4);
  .maskContent {
    width: 100%;
    height: 300px;
    overflow: auto;
    position: fixed;
    left: 0;
    bottom: 0;
    background: #fff;
    border-radius: 8px;
    text-align: center;
    h3 {
      padding: 20px 0;
      box-sizing: border-box;
      font-weight: normal;
      border-bottom: 2px solid #eee;
    }
    .conponArray {
      display: flex;
      flex-direction: column;
      .couponList {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        border-radius: 20px;
        background: #fff6eb;
        color: #d73e06;
        margin: 10px;
        .priceNow {
          font-size: 23px;
          font-weight: 600;
        }
        .centerCon {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          > span:first-child {
            font-size: 15px;
            font-weight: 600;
          }
          > span:nth-child(2) {
            font-size: 10px;
          }
          > span:nth-child(3) {
            font-size: 10px;
          }
        }
        .goGet {
          font-size: 13px;
          padding: 3px 10px;
          box-sizing: border-box;
          border: 1px solid #d73e06;
          border-radius: 15px;
        }
      }
    }
  }
}

// .payBox.payActive {
//   // max-height: 1.8rem;
//   overflow: hidden;
// }
</style>