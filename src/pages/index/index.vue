<template>
    <view class="container">
      <!-- 轮播图部分 -->
      <swiper 
        class="swiper" 
        :circular="true"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="1000"
      >
        <swiper-item v-for="item in bannerList" :key="item.image">
          <image :src="item.image" mode="aspectFill"/>
        </swiper-item>
      </swiper>
  
      <!-- 票夹选择器 -->
      <view class="wallet-selector">
        <text class="wallet-text">当前票夹<text v-if="NotMsg.length>0">：</text></text>
        <text class="wallet-name" @click="JumpTab">{{ NotMsg }}</text>
        <text class="login-type" @click="onRefreshIconClick">{{ Loggedby.name }}</text>
        <u-icon 
          @click="onRefreshIconClick"
           name="bag"
          :size="24"
          color="rgb(84, 135, 220)"
        />
      </view>
  
      <!-- 功能网格 -->
      <view class="grid-container">
        <view v-for="item in gridItems" :key="item.billFuncId" class="grid-item" @click="() => handleGridClick(item)">
          <view class="grid-icon">
            <u-icon 
              :name="item.billFuncPhoto"
              :size="32"
            />
          </view>
          <text class="grid-text">{{ item.billFuncName }}</text>
        </view>
      </view>
  
      <!-- 底部导航栏 -->
      <uni-tabbar></uni-tabbar>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow,onLoad } from '@dcloudio/uni-app'
import uniTabbar from '@/uni_modules/uni-tabbar/components/uni-tabbar/uni-tabbar.vue'
import {Userconfig,envconfig} from '@/config';
import request from '@/utils/request';
import type { ApiResponse } from '@/utils/api';
import { hideLoading, showLoading, showModal } from '@/utils/ShowTips';

// 定义响应式数据
const Loggedby = ref({ id: 0, name: "请选择票夹" ,cusdTidn:''});
const NotMsg = ref("");
const token = ref("");
const { baseUrl } = Userconfig();
const envbaseUrl = envconfig().baseUrl
const UserInfo = ref();
const bannerList = ref([
    { image: envbaseUrl + "file/uploaded_images/system/Carousel1.png" },
    { image: envbaseUrl + "file/uploaded_images/system/Carousel2.png" },
    { image: envbaseUrl + "file/uploaded_images/system/Carousel3.png" },
    { image: envbaseUrl + "file/uploaded_images/system/Carousel4.png" }
]);
const gridItems = ref([
    {billFuncId:0, billFuncName: "", billFuncPhoto: "", billFuncInvoke: "" }
]);

// 生命周期钩子
onMounted(() => {
    // 可以在这里添加挂载后的逻辑
    uni.$on('updatemsg', () => {
      NotMsg.value = '';
      Loggedby.value = { id: 0, name: "请选择票夹" ,cusdTidn:''}
    });
})

onShow(() => {
    uni.$emit("updateTab", "/pages/index/index");
    token.value = uni.getStorageSync("access_token");
    const LoggedbyPS = uni.getStorageSync("Loggedby");
    if (LoggedbyPS) Loggedby.value = LoggedbyPS;
    GetGrid();
    GetLoginData();
});

onLoad(() => {
    token.value = uni.getStorageSync("access_token");
    const LoggedbyPS = uni.getStorageSync("Loggedby");
    if (LoggedbyPS) Loggedby.value = LoggedbyPS;
    GetGrid();
    GetLoginData();
});

// 定义方法
const GetLoginData = () => {
    if (token.value) {
        UserInfo.value = uni.getStorageSync("UserInfo");
        if (Loggedby.value.id === 0) {
            request({
                url: "api/cusDetail/byUserId",
                method: "GET",
                data: { cusdUserId: UserInfo.value.id }
            }).then((res:ApiResponse) => {
                if (res.data.status === 200) {
                    const data = res.data.data.find((a) => a.isdefault === 1);
                    if (data!== undefined) {
                        Loggedby.value = { id: data.cusdId, name: data.cusdCpname,cusdTidn:data.cusdTidn };
                    }
                }
            });
        }
        GetPending();
    }
};

const GetPending = () => {
    request({
        url: "api/imageTest/byBillUserId",
        method: "GET",
        data: { billUserId: UserInfo.value.id, status: 0 }
    }).then((res:ApiResponse) => {
        if (res.data.status === 200) {
            let Msg = "";
            const data = res.data.data;
            const Notidentified = data.filter((a) => a.billStatus == 1).length;
            const NotSubmitted = data.filter((a) => a.billStatus == 2).length;
            if (NotSubmitted!== 0) Msg += `待提交(${NotSubmitted})`;
            if (NotSubmitted == 0 && Notidentified!== 0) Msg += `待识别(${Notidentified})`;
            if (NotSubmitted != 0 && Notidentified!== 0) Msg += `\n待识别(${Notidentified})`;
            NotMsg.value = Msg;
        }
    });
};

const GetGrid = () => {
    uni.request({
        url: envbaseUrl+"api/billFunction/queryAll",
        method: "GET"
    }).then((res:ApiResponse) => {
        if (res.data.status === 200) {
            const data = res.data.data;
            data.forEach((element) => {
                element.billFuncPhoto = envbaseUrl + "file" + element.billFuncPhoto.replace(/\\/g, "/");
            });
            gridItems.value = data;
        }
    });
};

const handleGridClick = (item:any) => {
    switch (item.billFuncInvoke) {
        case "onEleClick":
            onEleClick();
            break;
    }
};

const onEleClick = () => {
    if (!token.value) {
        showModal({
            title: "提示",
            content: "请先登录",
            showCancel: false,
            success(res) {
                if (res.confirm) {
                    uni.switchTab({ url: "../my/my" });
                }
            }
        });
        return;
    }
    console.log("aaaa");
    uni.showActionSheet({
        itemList: ["从相册中选择", "拍照"],
        success(result) {
            if (result.tapIndex === 0) uploadAndRecognize(["album"]);
            else uploadAndRecognize(["camera"]);
        }
    });
};

const uploadAndRecognize = async (sourceType) => {
    uni.chooseImage({
        count: 1,
        mediaType: ["image"],
        sourceType,
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            showLoading("上传中...");
            uni.uploadFile({
                filePath: tempFilePath,
                name: "photo",
                url: baseUrl + "api/pictureRec/recognize2",
                header: {
                    "content-type": "application/json",
                    "Authorization": `${token.value}`
                },
                success: (res2) => {
                    if (res2.statusCode === 200) {
                        const data = JSON.parse(res2.data);
                        if (data.data.billStatus === 1) {
                            hideLoading();
                            showModal({ content: "识别队列中，请稍后票夹查看", showCancel: false });
                        } else {
                           hideLoading();
                           uni.navigateTo({ url: `../wallet/receipt-detail?Jump=0&id=${data.data.billMId}` });
                        }
                    } else {
                        hideLoading();
                        showModal('图片上传失败(请上传发票)');
                    }
                }
            });
        }
    });
};

const onRefreshIconClick = (e) => {
    if (!token.value) {
        showModal({
            title: "提示",
            content: "请先登录",
            showCancel: false,
            success(res) {
                if (res.confirm) {
                    uni.switchTab({ url: "../my/my" });
                }
            }
        });
        return;
    }
    uni.navigateTo({
        url: "../corporation/corporation"
    });
};

const JumpTab=()=>{
    uni.switchTab({url:'../wallet/wallet'})
}
</script>  
  
<style lang="scss" scoped>
.swiper {
  height: 400rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.swiper image {
  width: 100%;
  height: 100%;
}

.wallet-selector {
  margin: 30rpx 0;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.login-type {
  flex: 1;
  text-align: right;
  padding-right: 20rpx;
  color: #666;
  font-size: 28rpx;
}

.wallet-selector img {
  width: 40rpx;
  height: 40rpx;
  margin-left: auto;
  filter: brightness(0) saturate(100%) invert(88%) sepia(8%) saturate(1266%) hue-rotate(64deg) brightness(93%) contrast(90%);
}

.picker {
  flex: 1;
  padding: 10rpx 20rpx;
  background-color: #f8f8f8;
  border-radius: 6rpx;
  margin-left: 20rpx;
}

.statistics {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 0;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.wallet-text{
  font-size: 26rpx;
}
.wallet-name{
  color: rgb(84, 135, 220);
  font-size: 26rpx;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number {
  font-size: 36rpx;
  font-weight: bold;
  color: #3cc51f;
  margin-bottom: 10rpx;
}

.label {
  font-size: 24rpx;
  color: #666;
}

.scan-btn {
  position: fixed;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  background-color: #3cc51f;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(60,197,31,0.3);
}

.scan-btn span {
  margin: 0 10rpx;
}

.scan-btn .iconfont {
  font-size: 40rpx;
}

.grid-container {
  padding: 20rpx;
  background-color: #ffffff;
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  height: calc(50vh);
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.grid-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-icon img {
  width: 100%;
  height: 100%;
}

.grid-text {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}
</style>