<template>
  <div class="wrap">
    <!-- 支付成功 -->
    <img v-if="showFlag" src="../../static/successIcon.png" alt />
    <img v-if="showFlag1" src="../../static/cancelIcon.png" alt />
    <h3 v-if="showFlag">支付成功</h3>
    <h3 v-if="showFlag1">支付失败</h3>
    <span>订单号：{{orderCode}}</span>
  </div>
</template>

<script>
import { Toast, MessageBox, Indicator } from "mint-ui";
export default {
  data() {
    return {
      token: "",
      orderCode: "", //订单号
      payMethodFlag: "", // 支付方式
      showFlag: false,
      showFlag1: false,
    };
  },
  methods: {
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
          // console.log(res, "-------------是否支付成功");
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
  },
  mounted() {
    Indicator.open({
      text: "加载中...",
      spinnerType: "fading-circle",
    });

    setTimeout(() => {
      Indicator.close();
    }, 2000);
  },
  async created() {
    // console.log(this.$route.query);
    this.token = this.$route.query.token;
    this.orderCode = this.$route.query.orderCode;
    this.payMethodFlag = this.$route.query.payMethodFlag;

    await this.isPayArray();
  },
};
</script>

<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 200px;
  > img {
    width: 68px;
    height: 68px;
  }
  h3 {
    margin-top: 20px;
  }
  span {
    margin-top: 10px;
    color: #999999;
    font-size: 13px;
  }
}
</style>