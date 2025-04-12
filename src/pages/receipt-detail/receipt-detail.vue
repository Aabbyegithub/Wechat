<template>
  <view class="container">
    <view class="detail-card">
      <view class="detail-item">
        <text class="label">发票代码：</text>
        <text class="value">{{ receipt.code }}</text>
      </view>
      <view class="detail-item">
        <text class="label">发票号码：</text>
        <text class="value">{{ receipt.number }}</text>
      </view>
      <view class="detail-item">
        <text class="label">开票日期：</text>
        <text class="value">{{ receipt.date }}</text>
      </view>
      <view class="detail-item">
        <text class="label">销售方：</text>
        <text class="value">{{ receipt.seller }}</text>
      </view>
      <view class="detail-item">
        <text class="label">购买方：</text>
        <text class="value">{{ receipt.buyer }}</text>
      </view>
      <view class="detail-item">
        <text class="label">金额：</text>
        <text class="value">¥{{ receipt.amount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const receipt = ref({
  code: '',
  number: '',
  date: '',
  seller: '',
  buyer: '',
  amount: ''
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.$vm?.options?.id
  if (id) {
    loadReceiptDetail(id)
  }
})

const loadReceiptDetail = async (id: string) => {
  try {
    // 模拟数据，实际项目中替换为API调用
    receipt.value = {
      code: '1234567890',
      number: '12345678',
      date: '2024-01-20',
      seller: '公司A',
      buyer: '公司B',
      amount: '1000.00'
    }
  } catch (error) {
    uni.showToast({
      title: '获取票据详情失败',
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

.detail-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
}

.detail-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  width: 180rpx;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
}
</style>