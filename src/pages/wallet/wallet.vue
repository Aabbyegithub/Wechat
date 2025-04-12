<template>
  <view class="container">
    <!-- 添加票夹按钮 -->
    <view class="add-btn" @tap="showAddWallet">
      <text class="iconfont icon-add"></text>
      <text>添加新票夹</text>
    </view>

    <!-- 票夹列表 -->
    <view class="wallet-list">
      <view class="wallet-item" 
            v-for="(item, index) in walletList" 
            :key="index"
            @tap="showReceipts(item)"
            @touchstart="touchStart"
            @touchmove="touchMove($event, index)"
            @touchend="touchEnd">
        <view class="wallet-info" :style="{ transform: `translateX(${item.offset}px)` }">
          <text class="company-name">{{ item.companyName }}</text>
          <text class="tax-number">税号：{{ item.taxNumber }}</text>
          <text class="receipt-count">票据数量：{{ item.receiptCount }}</text>
        </view>
        <view class="action-buttons">
          <view class="edit-btn" @tap.stop="editWallet(item)">编辑</view>
          <view class="delete-btn" @tap.stop="deleteWallet(item)">删除</view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑票夹弹窗 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="popup-title">{{ isEdit ? '编辑票夹' : '添加票夹' }}</view>
        <input v-model="formData.companyName" placeholder="请输入公司名称" />
        <input v-model="formData.taxNumber" placeholder="请输入纳税人识别号" :disabled="isEdit"/>
        <view class="popup-buttons">
          <button class="cancel-btn" @tap="closePopup">取消</button>
          <button class="confirm-btn" @tap="submitWallet">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 票据明细弹窗 -->
    <uni-popup ref="receiptPopup" type="center">
      <view class="receipt-detail">
        <view class="receipt-title">票据明细</view>
        <view class="receipt-list">
          <view class="receipt-item" v-for="(receipt, index) in receiptList" :key="index" @tap="showReceiptDetail(receipt)">
            <view class="receipt-row">
              <text>销售方：{{ receipt.seller }}</text>
            </view>
            <view class="receipt-row">
              <text>购买方：{{ receipt.buyer }}</text>
            </view>
            <view class="receipt-row">
              <text>金额：¥{{ receipt.amount }}</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

// 添加初始化数据加载
import { onMounted } from 'vue'

onMounted(() => {
  loadWalletList()
})

// 添加加载票夹列表方法
const loadWalletList = async () => {
  try {
    // 模拟数据，实际项目中替换为API调用
    walletList.value = [
      { 
        id: 1, 
        companyName: '测试公司1', 
        taxNumber: '91110105MA01XXXXX', 
        receiptCount: 5,
        offset: 0 
      },
      { 
        id: 2, 
        companyName: '测试公司2', 
        taxNumber: '91110105MA01YYYYY', 
        receiptCount: 3,
        offset: 0 
      }
    ]
  } catch (error) {
    uni.showToast({
      title: '获取票夹列表失败',
      icon: 'none'
    })
  }
}

const popup = ref(null)
const receiptPopup = ref(null)
const isEdit = ref(false)
const startX = ref(0)
const walletList = ref([])
const receiptList = ref([])

const formData = ref({
  companyName: '',
  taxNumber: ''
})

// 显示添加票夹弹窗
const showAddWallet = () => {
  isEdit.value = false
  formData.value = {
    companyName: '',
    taxNumber: ''
  }
  popup.value.open()
}

// 编辑票夹
const editWallet = (wallet: any) => {
  isEdit.value = true
  formData.value = {
    ...wallet
  }
  popup.value.open()
}

// 删除票夹
const deleteWallet = async (wallet: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该票夹吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // await api.deleteWallet(wallet.id)
          const index = walletList.value.findIndex(item => item.id === wallet.id)
          walletList.value.splice(index, 1)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 提交票夹信息
const submitWallet = async () => {
  if (!formData.value.companyName || !formData.value.taxNumber) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  try {
    if (isEdit.value) {
      // await api.updateWallet(formData.value)
    } else {
      // await api.createWallet(formData.value)
    }
    popup.value.close()
    loadWalletList()
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 关闭弹窗
const closePopup = () => {
  popup.value.close()
}

// 显示票据明细
const showReceipts = async (wallet: any) => {
  try {
    // const res = await api.getReceiptList(wallet.id)
    // receiptList.value = res.data
    receiptList.value = [
      { seller: '公司A', buyer: '公司B', amount: '1000.00' },
      { seller: '公司C', buyer: '公司D', amount: '2000.00' }
    ]
    receiptPopup.value.open()
  } catch (error) {
    uni.showToast({
      title: '获取票据失败',
      icon: 'none'
    })
  }
}

// 显示票据详情
const showReceiptDetail = (receipt: any) => {
  uni.navigateTo({
    url: `/pages/receipt-detail/receipt-detail?id=${receipt.id}`
  })
}

// 触摸开始
const touchStart = (e: any) => {
  startX.value = e.touches[0].clientX
}

// 触摸移动
const touchMove = (e: any, index: number) => {
  const moveX = e.touches[0].clientX
  const offset = moveX - startX.value
  if (offset < -80) {
    walletList.value[index].offset = -80
  } else if (offset > 0) {
    walletList.value[index].offset = 0
  } else {
    walletList.value[index].offset = offset
  }
}

// 触摸结束
const touchEnd = () => {
  startX.value = 0
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.add-btn {
  background-color: #3cc51f;
  color: #fff;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn text {
  margin: 0 10rpx;
}

.wallet-list {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.wallet-item {
  position: relative;
  overflow: hidden;
}

.wallet-info {
  background-color: #fff;
  padding: 20rpx;
  transition: transform 0.3s;
}

.company-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.tax-number, .receipt-count {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.action-buttons {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  display: flex;
}

.edit-btn, .delete-btn {
  width: 120rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.edit-btn {
  background-color: #007aff;
}

.delete-btn {
  background-color: #ff3b30;
}

.popup-content {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  width: 600rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.popup-content input {
  border: 1rpx solid #ddd;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 6rpx;
}

.popup-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
}

.popup-buttons button {
  width: 45%;
}

.cancel-btn {
  background-color: #f2f2f2;
}

.confirm-btn {
  background-color: #3cc51f;
  color: #fff;
}

.receipt-detail {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  width: 600rpx;
  max-height: 800rpx;
  overflow-y: auto;
}

.receipt-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.receipt-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.receipt-row {
  margin-bottom: 10rpx;
}

.receipt-row:last-child {
  margin-bottom: 0;
}
</style>