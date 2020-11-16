<template>
  <div class="box">
    <div class="wrap" @click.capture="addressShow = false">
      <!-- 添加收货地址  -->
      <div class="addressEdit">
        <div class="messageDiv">
          <span>收货人</span>
          <input v-model="nameIpt" type="text" placeholder="姓名" />
        </div>
        <div class="messageDiv">
          <span>联系电话</span>
          <input v-model="phoneIpt" type="number" maxlength="11" placeholder="手机号或固话（需加区号）" />
        </div>
        <div class="messageDiv cityDiv" @click="addressShow = true">
          <span>选择城市</span>
          <input v-model="cityIpt" type="text" placeholder="选择城市" readonly />
        </div>

        <div class="messageDiv">
          <span>详细地址</span>
          <input v-model="addressIpt" type="text" placeholder="请输入您的详细地址（门牌号）" />
        </div>
      </div>

      <div class="saveAddress">
        <p @click="saveAddressBtn">保存地址</p>
      </div>
    </div>

    <div class="pickerDiv" v-if="addressShow">
      <van-area title="标题" :area-list="areaList" @confirm="confirmFn" @cancel="cancelFn" />
    </div>
  </div>
</template>

<script>
import AddressInfo from "../assets/js/area.js";
import { Toast, Indicator, MessageBox } from "mint-ui";
export default {
  data() {
    return {
      token: "",
      nameIpt: "", //收货人
      phoneIpt: "", //联系电话
      cityIpt: "", //城市
      addressIpt: "", //详细地址
      addressShow: false, //选择城市默认不展示
      addressId: "", //修改地址时传id

      areaList: AddressInfo, //picker城市
    };
  },
  methods: {
    //点击任意地方取消picker
    // boxBlock() {
    //   if (!event.target.closest(".cityDiv")) {
    //     this.addressShow = false;
    //   }
    //   console.log(event.target,'----------cityDiv')
    // },
    //选择城市
    // changeCity() {
    //   this.addressShow = true;
    // },
    //picker确定
    confirmFn(e) {
      this.addressShow = false;
      // console.log(e[0].name, e[1].name, e[2].name);
      this.cityIpt = e[0].name + " " + e[1].name + " " + e[2].name;
    },

    //picker取消
    cancelFn() {
      this.addressShow = false;
    },

    //保存地址
    saveAddressBtn() {
      if (this.nameIpt.length == "") {
        Toast({
          message: "请输入姓名",
          duration: 2000,
        });
      } else if (!/^1[34578]\d{9}$/.test(this.phoneIpt)) {
        Toast({
          message: "请输入正确的手机号",
          duration: 2000,
        });
      } else if (this.cityIpt.length == "") {
        Toast({
          message: "请选择城市",
          duration: 2000,
        });
      } else if (this.addressIpt.length == "") {
        Toast({
          message: "请输入详细地址",
          duration: 2000,
        });
      } else {
        this.$axios
          .post(
            "/home/personal/reduce_address",
            this.$qs.stringify({
              token: this.token,
              name: this.nameIpt,
              address: this.addressIpt,
              city: this.cityIpt,
              mobile: this.phoneIpt,
              id: this.addressId,
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
            this.$router.go(-1);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
  },
  created() {
    this.token = this.$route.query.token;
    if (this.$route.query.editArr) {
      this.nameIpt = this.$route.query.editArr.name;
      this.phoneIpt = this.$route.query.editArr.mobile;
      this.cityIpt = this.$route.query.editArr.city;
      this.addressIpt = this.$route.query.editArr.address;
      this.addressId = this.$route.query.editArr.id;
    }
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100vh;
  background: #f5f2f2;
}

.wrap {
  width: 100%;
  height: 100%;
  background: #f5f2f2;
  padding: 20px 0;
  box-sizing: border-box;
}

.addressEdit {
  width: 100%;
  background: #fff;
  .messageDiv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #f9f5f5;
    > span {
      font-size: 15px;
    }
    > input {
      width: 75%;
      border: none;
      font-size: 15px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: right;
    }
  }
}

.saveAddress {
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

.pickerDiv {
  width: 100%;
  position: fixed;
  bottom: 0;
}
</style>