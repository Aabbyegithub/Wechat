<template>
  <view class="container">
    <!-- 轮播图 -->
    <swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
      <swiper-item v-for="(item, index) in bannerList" :key="index">
        <image :src="item.image" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 当前票夹选择 -->
    <view class="wallet-selector">
      <text>当前票夹：</text>
      <picker @change="onWalletChange" :range="walletList" range-key="name">
        <view class="picker">
          {{ currentWallet.name || '请选择票夹' }}
        </view>
      </picker>
    </view>

    <!-- 票据统计 -->
    <view class="statistics">
      <view class="stat-item">
        <text class="number">{{ totalReceipts }}</text>
        <text class="label">总票据数</text>
      </view>
      <view class="stat-item">
        <text class="number">{{ todayReceipts }}</text>
        <text class="label">今日新增</text>
      </view>
    </view>

    <!-- 拍照识别按钮 -->
    <view class="scan-btn" @tap="scanReceipt">
      <text class="iconfont icon-camera"></text>
      <text>拍照识别</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const bannerList = ref([
  { image: '/static/home/invoice_1.png' },
  { image: '/static/home/invoice_2.png' },
  { image: '/static/home/invoice_3.png' },
  { image: '/static/home/invoice_4.png' }
])

const walletList = ref([])
const currentWallet = ref({})
const totalReceipts = ref(0)
const todayReceipts = ref(0)

onMounted(() => {
  loadWalletList()
  loadStatistics()
})

const loadWalletList = async () => {
  try {
    // 这里调用后端API获取票夹列表
    // const res = await api.getWalletList()
    // walletList.value = res.data
    walletList.value = [
      { id: 1, name: '默认票夹' },
      { id: 2, name: '公司票夹' }
    ]
  } catch (error) {
    uni.showToast({
      title: '获取票夹列表失败',
      icon: 'none'
    })
  }
}

const loadStatistics = async () => {
  try {
    // 这里调用后端API获取统计数据
    // const res = await api.getStatistics()
    totalReceipts.value = 128
    todayReceipts.value = 5
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

const onWalletChange = (e: any) => {
  const index = e.detail.value
  currentWallet.value = walletList.value[index]
  // 保存选择的票夹
  uni.setStorageSync('currentWallet', currentWallet.value)
}

const scanReceipt = () => {
  // 检查currentWallet是否有值且包含id属性
  if (!currentWallet.value || !('id' in currentWallet.value)) {
    uni.showToast({
      title: '请先选择票夹',
      icon: 'none'
    })
    return
  }

  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 上传图片并识别
      uploadAndRecognize(tempFilePath)
    }
  })
}

const uploadAndRecognize = async (filePath: string) => {
  uni.showLoading({
    title: '识别中...'
  })
  
  try {
    // 这里调用后端API上传并识别票据
    // const res = await api.recognizeReceipt(filePath)
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({
        title: '识别成功',
        icon: 'success'
      })
    }, 2000)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '识别失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

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

.scan-btn text {
  margin: 0 10rpx;
}

.scan-btn .iconfont {
  font-size: 40rpx;
}
</style>