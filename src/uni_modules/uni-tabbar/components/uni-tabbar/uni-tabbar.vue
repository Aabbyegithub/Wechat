<template>
    <view class="custom-tabbar">
      <view
        v-for="(item, index) in tabs"
        :key="index"
        class="custom-tabbar__item"
        @click="handleTabClick(index)"
      >
        <view
          class="custom-tabbar__icon"
          :class="{ active: isActive(index) }"
        >
          <!-- <uni-icons
            :type="item.icon"
            :color="isActive(index) ? activeColor : inactiveColor"
            :size="26"
          /> -->
          <u-icon :name="item.icon" :color="isActive(index) ? 'rgb(84, 135, 220)' : 'rgb(153, 153, 153)'" :size="26"></u-icon>
          <!-- 红点 -->
          <view
            v-if="item.dot"
            class="custom-tabbar__dot"
          ></view>
          <!-- 数字角标 -->
          <view
            v-if="item.badge && item.badge.value > 0"
            class="custom-tabbar__badge"
          >
            {{ item.badge.value > 99 ? '99+' : item.badge }}
          </view>
        </view>
        <view
          class="custom-tabbar__text"
          :class="{ active: isActive(index) }"
        >
          {{ item.text }}
        </view>
      </view>
    </view>
  </template>
  
<script lang="ts" setup>
import type { ApiResponse } from '@/utils/api'
import request from '@/utils/request'
import { onShow } from '@dcloudio/uni-app'
import { ref, onMounted, onUnmounted } from 'vue'
  const currentTab = ref(0)
  const badgeCount=ref(0)
  const UserInfo = ref()
  let timer: number;
  const tabs = [
    { text: '首页', icon: 'home', path: '/pages/index/index', dot: false },
    { text: '票夹', icon: 'folder', path: '/pages/wallet/wallet', badge: badgeCount },
    { text: '我的', icon: 'account', path: '/pages/my/my', dot: false }
  ]
  const isActive = (index: number) => currentTab.value === index
  
  const handleTabClick = (index: number) => {
    if (currentTab.value === index) return
    const target = tabs[index]
    uni.switchTab({
      url: target.path,
      success: () => {
        currentTab.value = index
      },
      fail: (err) => {
        console.error('switchTab failed:', err)
      }
    })
  }
  
  const updateCurrentTab = () => {
    const pages = getCurrentPages()
    const route = '/' + (pages.at(-1)?.route || '')
    const index = tabs.findIndex((item: { path: string,text:string,icon:string }) => item.path === route)
    if (index !== -1) {
      currentTab.value = index
    }
  }
  
  onMounted(() => {
    updateCurrentTab()
    uni.$on('updateTab', (path: string) => {
      const index = tabs.findIndex(item => item.path === path)
      if (index !== -1) {
        currentTab.value = index
      }
    })
    uni.$on('updateBadge', (count: number) => {
      badgeCount.value = count;
    });
  })
  onShow(()=>{
    UserInfo.value = uni.getStorageSync('UserInfo')
    if(UserInfo){
      GetBills()
    }
  })



  // 获取未处理票据数量
  const GetBills=()=>{
  request({
    url:'api/imageTest/byBillUserId',
    method:'GET',
    data:{ billUserId:UserInfo.value.id,status:0}
  }).then((res:ApiResponse)=>{
    if(res.data.status===200){
      var data = res.data.data
      badgeCount.value = data.length
    }
  })
}
  </script>
  <style lang="scss" scoped>
  .custom-tabbar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background-color: #fff;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);
    z-index: 999;
    padding-bottom: env(safe-area-inset-bottom);
  
    &__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      animation: fadeIn 0.3s ease;
    }
  
    &__icon {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(1);
      transition: transform 0.25s ease;
      &.active {
        transform: scale(1.15);
      }
    }
  
    &__text {
      font-size: 30rpx;
      color: #666;
      margin-top: 4rpx;
      transition: color 0.2s ease;
  
      &.active {
        color: rgb(84, 135, 220);
      }
    }
  
    &__dot {
      position: absolute;
      top: 2rpx;
      right: 0rpx;
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      background-color: red;
    }
  
    &__badge {
      position: absolute;
      top: 0rpx;
      right: 0rpx;
      padding: 0 6rpx;
      background-color: red;
      color: #fff;
      font-size: 20rpx;
      line-height: 28rpx;
      border-radius: 100rpx;
      white-space: nowrap;
    }
  
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10rpx);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
  </style>
  