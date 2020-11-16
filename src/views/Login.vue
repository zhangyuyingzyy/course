<template>
  <div class="wrap">
    <!-- 登录 -->
    <div class="titleTips">
      <span>优思美术小提示：购买课程请保证手机号正确</span>
    </div>
    <p class="loginTitle">账号登录</p>
    <div class="loginContent">
      <div class="telDiv">
        <img src="../../static/telIcon.png" alt />
        <input v-model="phoneIpt" type="number" placeholder="请输入手机号" maxlength="11" />
      </div>
      <div class="passwordDiv">
        <div class="passwordLeft">
          <img src="../../static/codeIcon.png" alt />
          <input v-model="codeIpt" type="number" placeholder="请输入验证码" />
        </div>
        <!-- <span class="getCode" @click="getCodeBtn">获取验证码</span> -->
        <button :disabled="codeStatus" class="getCode" @click="getCodeBtn">{{showCode}}</button>
      </div>
    </div>

    <div class="loginBtn">
      <p @click="loginBtn">登录</p>
    </div>
  </div>
</template>

<script>
import { Toast } from "mint-ui";
export default {
  data() {
    return {
      token: "",
      phoneIpt: "", //手机号
      codeIpt: "", //验证码
      showCode: "获取验证码",
      codeStatus: false, //是否能点击获取验证码的状态判断
      codeTime: "60", //一分钟时间
    };
  },
  methods: {
    //登录
    loginBtn() {
      this.$axios
        .post(
          "/applet_api/auth/fast_login",
          this.$qs.stringify({
            token: this.token,
            mobile: this.phoneIpt,
            code: this.codeIpt,
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
              message: "登录成功",
              duration: 2000,
            });
            this.$router.go(-1);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    //获取验证码
    getCodeBtn() {
      if (!/^1[34578]\d{9}$/.test(this.phoneIpt)) {
        // console.log("电话号码格式错误");
        Toast({
          message: "请输入正确的手机号",
          duration: 2000,
        });
      } else {
        this.$axios
          .post(
            "/applet_api/auth/send_code",
            this.$qs.stringify({
              token: this.token,
              mobile: this.phoneIpt,
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
            // console.log(res, "验证码");
            if (res.data.code == "200") {
              Toast({
                message: "验证码已发送",
                duration: 2000,
              });
              var inter = setInterval(
                function () {
                  this.codeStatus = true;
                  this.showCode = this.codeTime + "s后重发";
                  this.codeTime = this.codeTime - 1;

                  if (this.codeTime < 0) {
                    clearInterval(inter);
                    this.showCode = "发送验证码";
                    this.codeTime = 60;
                    this.codeStatus = false;
                  }
                }.bind(this),
                1000
              );
            } else {
              Toast({
                message: res.data.message,
                duration: 2000,
              });
            }
          })
          .catch((res) => {
            // console.log(res);
            Toast({
              message: res.data.message,
              duration: 2000,
            });
            this.showCode = "发送验证码";
            this.codeTime = 60;
            this.codeStatus = false;
          });
      }
    },
  },
  created() {
    this.token = this.$route.query.token;
  },
};
</script>

<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: 100%;
}

.titleTips {
  width: 100%;
  background: rgba(221, 71, 21, 0.1);
  display: flex;
  align-items: center;
  > span {
    color: #dd4715;
    font-size: 13px;
    padding: 10px 20px;
    box-sizing: border-box;
  }
}

.loginTitle {
  font-size: 28px;
  font-weight: 500;
  margin: 20px;
}

.loginContent {
  display: flex;
  flex-direction: column;
  margin: 0 20px;
  .telDiv {
    display: flex;
    align-items: center;
    padding: 20px 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #eeeeee;
    > img {
      width: 15px;
      height: 20px;
      margin-right: 30px;
    }
    > input {
      border: none;
      font-size: 16px;
    }
  }
  .passwordDiv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 20px 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #eeeeee;
    .passwordLeft {
      display: flex;
      > img {
        width: 15px;
        height: 20px;
        margin-right: 30px;
      }
      > input {
        border: none;
        font-size: 16px;
      }
    }
    .getCode {
      padding: 0 10px;
      box-sizing: border-box;
      font-size: 13px;
      color: #dd4715;
      border-left: 1px solid #f1f1f1;
      border: none;
      background: #fff;
    }
  }
}

.loginBtn {
  margin: 0 20px;
  > p {
    background: #ffda27;
    width: 100%;
    padding: 15px 0;
    box-sizing: border-box;
    border-radius: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 60px;
  }
}
</style>