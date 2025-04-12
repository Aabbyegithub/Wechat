<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info" v-if="userInfo.nickName">
      <image class="avatar" :src="userInfo.avatarUrl"></image>
      <view class="info">
        <text class="nickname">{{ userInfo.nickName }}</text>
        <text class="phone">{{ userInfo.phoneNumber || '未绑定手机号' }}</text>
      </view>
    </view>

    <!-- 未登录状态 -->
    <view class="login-btn" v-else>
      <button @tap="getUserProfile">获取用户信息</button>
      <button @tap="getPhoneNumber" open-type="getPhoneNumber">获取手机号</button>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <view class="function-item" @tap="handleFunction('account')">
        <text class="iconfont icon-account"></text>
        <text>账户管理</text>
      </view>
      <view class="function-item" @tap="handleFunction('settings')">
        <text class="iconfont icon-settings"></text>
        <text>系统设置</text>
      </view>
      <view class="function-item" @tap="handleFunction('about')">
        <text class="iconfont icon-about"></text>
        <text>关于我们</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref({
  nickName: '',
  avatarUrl: '',
  phoneNumber: ''
})

const getUserProfile = () => {
  uni.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      userInfo.value = { ...userInfo.value, ...res.userInfo }
      // 调用后端API保存用户信息
      saveUserInfo(res.userInfo)
    },
    fail: (err) => {
      uni.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  })
}

const getPhoneNumber = (e: any) => {
  if (e.detail.code) {
    // 这里需要调用后端API获取手机号
    console.log('手机号授权码：', e.detail.code)
    // 示例：调用后端API
    // getPhoneNumberFromServer(e.detail.code)
  }
}

const saveUserInfo = async (info: any) => {
  try {
    // 这里调用后端API保存用户信息
    // await api.saveUserInfo(info)
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

const handleFunction = (type: string) => {
  switch (type) {
    case 'account':
      uni.navigateTo({ url: '/pages/account/account' })
      break
    case 'settings':
      uni.navigateTo({ url: '/pages/settings/settings' })
      break
    case 'about':
      uni.navigateTo({ url: '/pages/about/about' })
      break
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.user-info {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.login-btn {
  padding: 40rpx;
}

.login-btn button {
  margin-bottom: 20rpx;
  background-color: #3cc51f;
  color: #fff;
}

.login-btn button:last-child {
  margin-bottom: 0;
}

.function-list {
  margin-top: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item text {
  margin-right: 20rpx;
  font-size: 28rpx;
}

.function-item .iconfont {
  font-size: 40rpx;
  color: #3cc51f;
}
</style>