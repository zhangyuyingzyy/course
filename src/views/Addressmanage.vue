<template>
  <div class="box">
    <!-- 地址管理 -->
    <div class="wrap">
      <div
        class="addressDiv"
        v-for="(item,index) in addressList"
        :key="index"
        @click="changeAddress(index)"
      >
        <div class="addressTop">
          <img class="addressIcon" src="../../static/addressIcon.png" alt />
          <span class="addressSpan">{{item.city}}{{item.address}}</span>
        </div>
        <div class="messageDiv">
          <span class="nameIpt">{{item.name}}</span>
          <span class="telephones">{{item.mobile}}</span>
        </div>
        <div class="operationDiv">
          <div class="checkLeft" @click.stop="checkoutIcon(index,item.name)">
            <!-- <p
              class="checkoutIcon"
              @click.stop="checkoutIcon(index,item.name)"
              :class="checkoutIndex==index?'checkoutActive':''"
            ></p> -->
            <p
              class="checkoutIcon"
              v-if="item.default == '1'"
            ></p>
            <p
              class="checkoutIcon1"
              v-if="item.default == '0'"
            ></p>
            <span class="defaultAddress">默认地址</span>
          </div>
          <span class="delBtn" @click.stop="delAddressBtn(index)">删除</span>
          <span class="editBtn" @click.stop="editAddressBtn(index)">编辑</span>
        </div>
      </div>

      <div class="addAddress" @click="addAddressBtn">
        <p>新增地址</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast, MessageBox } from "mint-ui";

export default {
  data() {
    return {
      token: "",
      addressList: [],
      checkoutIndex: -1, //默认不选中
    };
  },
  methods: {
    //地址列表
    addressArray() {
      this.$axios
        .post(
          "/home/personal/my_address",
          this.$qs.stringify({
            token: this.token,
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
          // console.log(res,'--------dz')
          this.addressList = res.data.data;
          // this.checkoutIndex = checkoutInd;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //默认地址
    checkoutIcon(checkoutInd, item) {
      // console.log('------123')
      let addressId = this.addressList[checkoutInd].id;
      this.$axios
        .post(
          "/home/personal/default_address",
          this.$qs.stringify({
            token: this.token,
            id: addressId,
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
          // this.checkoutIndex = checkoutInd;
          this.addressArray();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //新增地址
    addAddressBtn() {
      this.$router.push({
        path: "/address",
        query: {
          token: this.token,
        },
      });
    },

    //删除地址
    delAddressBtn(delInd) {
      let addressId = this.addressList[delInd].id;
      MessageBox({
        title: "提示",
        message: "确认删除吗？",
        showCancelButton: true,
      }).then((action) => {
        if (action == "confirm") {
          //确认的回调
          this.$axios
            .post(
              "/home/personal/del_address",
              this.$qs.stringify({
                token: this.token,
                id: addressId,
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
              this.addressArray();
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    },

    //编辑地址
    editAddressBtn(editInd) {
      let editArr = this.addressList[editInd];
      let addressId = this.addressList[editInd].id;
      this.$router.push({
        path: "/address",
        query: {
          token: this.token,
          editArr: editArr,
        },
      });
    },

    //选择地址
    changeAddress(changeInd) {

      let addressId = this.addressList[changeInd].id
      let changeArr = this.addressList[changeInd];
      localStorage.setItem("changeList", JSON.stringify(changeArr));
      localStorage.setItem("addressInfo", JSON.stringify(addressId));
      this.$router.go(-1);
    },
  },
  created() {
    this.token = this.$route.query.token;
    this.addressArray();
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
  padding: 20px;
  box-sizing: border-box;
}

.addressDiv {
  background: #fff;
  padding: 20px 15px;
  box-sizing: border-box;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 20px;
  .addressTop,
  .messageDiv,
  .operationDiv {
    display: flex;
    align-items: center;
  }
  .addressTop .addressIcon {
    margin-right: 10px;
    width: 15px;
    height: 15px;
  }
  .addressTop .addressSpan {
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }
  .messageDiv {
    margin-left: 25px;
    padding: 10px 0;
    box-sizing: border-box;
    border-bottom: 1px solid #f9f5f5;
    span {
      font-size: 13px;
      color: #666;
    }
    .nameIpt {
      margin-right: 10px;
    }
  }
  .operationDiv {
    justify-content: space-between;
    margin-top: 20px;
    .delBtn,
    .editBtn {
      color: #5d5d5d;
      font-size: 12px;
    }
    .checkLeft {
      display: flex;
      align-items: center;
      .checkoutIcon {
        width: 48px;
        height: 28px;
        margin-right: 5px;
        background: url(../../static/checkout.png) no-repeat;
        background-size: 100%;
      }
      .checkoutIcon1 {
        width: 48px;
        height: 28px;
        margin-right: 5px;
        background: url(../../static/checkout1.png) no-repeat;
        background-size: 100%;
      }
      .checkoutIcon.checkoutActive {
        width: 48px;
        height: 28px;
        margin-right: 5px;
        background: url(../../static/checkout.png) no-repeat;
        background-size: 100%;
      }
      .defaultAddress {
        color: #5d5d5d;
        font-size: 12px;
      }
    }
  }
}

.addAddress {
  background: #ffda27;
  width: 100%;
  padding: 15px 0;
  box-sizing: border-box;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}
</style>