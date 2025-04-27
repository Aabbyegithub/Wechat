<template>
  <view class="container" @click="closeSwipe">
    <view class="wallet-list">
      <u-swipe-action v-for="(item, index) in BillList" :key="index">
        <u-swipe-action-item 
          :options="swipebillOptions"
          @click="billhandleSwipeClick($event, item)"
          :show="currentSwipebill === index"

        >
          <view class="wallet-item" v-if="item.billStatus===1">
            <view class="left">
              <view style="display: flex;flex-direction: column; gap: 8rpx;">
                <text class="bill-status" style="border:2rpx solid rgb(84, 135, 220);color: rgb(84, 135, 220);width: 40px;font-size:24rpx;">待识别</text>
                <text style="font-size: 26rpx;">上传时间：{{ item.Addtime }}</text>
              </view>
            </view>
            <view class="right">
              <image
                :src="item.billPhoto" 
                style="width:80px;height: 40px;"
                mode="aspectFill"
                @click="previewImage(item.billPhoto)"
                lazy-load
              ></image>
            </view>
          </view>
          <view class="wallet-item" v-if="item.billStatus===2" @click="OpenDetail(item)">
            <view class="left">
              <view style="display: flex;flex-direction: column; gap: 8rpx;">
                <text class="bill-status" style="border:2rpx solid #f3260b;color: #f3260b;width: 40px;font-size:24rpx;">待提交</text>
                <view v-for="(itemListdetil,index) in item.itemList" :key="index"style="display: flex; align-items: center;">
                    <text style="width: 65px !important;text-align: right;font-size: 25rpx;">{{ itemListdetil.billTdName }}：</text>
                    <text style="font-size: 25rpx;">{{ itemListdetil.billTypeValue }}</text>
                </view>
              </view>
            </view>
            <view class="right">
              <image
                :src="item.billPhoto" 
                style="width:80px;height: 80px;"
                mode="aspectFill"
                @click.stop="previewImage(item.billPhoto)"
                lazy-load
              ></image>
            </view>
          </view>
        </u-swipe-action-item>
      </u-swipe-action>
    </view>
    <view class="wallet-list">
      <u-swipe-action v-for="(item, index) in walletList" :key="index">
        <u-swipe-action-item 
          :options="swipeOptions"
          @click="handleSwipeClick($event, item)"
          :show="currentSwipepack === index"
        >
          <view class="wallet-item" @click="OpenPack(item)">
            <view class="left">
              <u-icon name="coupon-fill" color="rgb(84, 135, 220)" size="30"></u-icon>
              <view class="wallet-info">
                <view class="wallet-row">
                  <text class="wallet-name">{{ item.cusdCpname }}</text>
                  <!-- <text class="wallet-tag" v-if="item.isdefault===1">默认</text> -->
                </view>
                <text class="wallet-label">{{item.cusdTidn}}</text>
                <text class="wallet-tag" v-if="item.isdefault===1">默认</text>
              </view>
            </view>
            <view class="right">
              <text class="wallet-count">{{ item.billCount }}张</text>
              <u-icon name="arrow-right" color="rgb(84, 135, 220)" size="30"></u-icon>
            </view>
          </view>
        </u-swipe-action-item>
      </u-swipe-action>
    </view>
    <view class="wallet-header">
      <text class="title">自定义票夹</text>
      <view class="add-btn" @tap="addWallet">
        <u-icon name="plus-circle" color="rgb(84, 135, 220)" size="30"></u-icon>
        <text class="add-text">添加票夹</text>
      </view>
    </view>
    <view class="bottom-tip" style="text-align: center; padding: 20rpx 0; color: #999;">
    ——— 已经到底啦 ———
    </view>

    <u-popup 
      :show="dialogVisible" 
      @close="closeDialog" 
      mode="center" 
      :round="20"
      :closeOnClickOverlay="true"
      :safeAreaInsetBottom="false"
    >
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? '修改票夹' : '添加票夹' }}</text>
        </view>
        
        <view class="dialog-body">
          <view class="form-item">
            <u-input
              v-model="form.companyName"
              placeholder="请输入公司名称"
              :border="true"
            ></u-input>
          </view>
          <view class="form-item">
            <u-input
              v-model="form.taxNumber"
              placeholder="请输入纳税人识别号"
              :border="true"
            ></u-input>
          </view>
        </view>
        
        <view class="dialog-footer">
          <u-button @click="closeDialog" plain size="medium">取消</u-button>
          <u-button @click="handleConfirm" type="primary" size="medium">确定</u-button>
        </view>
      </view>
    </u-popup>
  </view>
  <uni-tabbar></uni-tabbar>
</template>

<script setup lang="ts">
import uniTabbar from '@/uni_modules/uni-tabbar/components/uni-tabbar/uni-tabbar.vue'
import {  onMounted, ref } from 'vue'
import { onShow,onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import request from '@/utils/request';
import type { ApiResponse } from '@/utils/api'
import {showSuccess,showLoading,hideLoading,showModal, showError} from '@/utils/ShowTips'
import {Userconfig} from '@/config'
const {baseUrl}=Userconfig()
const walletList = ref([])
const UserInfo = ref()
const BillList =ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  companyName: '',
  taxNumber: '',
  editId: ''
})
const currentSwipebill = ref(-1)
const currentSwipepack = ref(-1)

onMounted(()=>{
  uni.$on('updateList', () => {
      walletList.value = [];
      BillList.value = [];
    });
})

onShow(() => {
  uni.$emit('updateTab', '/pages/wallet/wallet') 
  UserInfo.value = uni.getStorageSync('UserInfo')
  showLoading()
  GetPackages()
  GetBills()
  hideLoading()
})

onLoad(()=>{
  UserInfo.value = uni.getStorageSync('UserInfo')
  showLoading()
  GetPackages();
  GetBills();
  hideLoading()
})

// 刷新数据的方法
const refreshData = async () => {
  try {
    await Promise.all([
      GetPackages(),
       GetBills()
    ]);
    uni.stopPullDownRefresh();
    showSuccess('刷新成功')
  } catch (error) {
    // 发生错误时也要停止下拉刷新动画
    uni.stopPullDownRefresh();
    showError('刷新失败')
  }
};

// 监听下拉刷新事件
onPullDownRefresh(() => {
  refreshData();
});

const swipebillOptions = [
{
    text: '删除',
    style: {
      backgroundColor: '#fa3534',
      borderradius: '0 15px 15px 0' ,
      height: '100%' 
    }
  }
]

const swipeOptions = [
{
    text: '默认',
    style: {
      backgroundColor: '#2f2f30',
      height: '100%'
    }
  },
  {
    text: '编辑',
    style: {
      backgroundColor: '#2979ff',
      height: '100%'
    }
  },
  {
    text: '删除',
    style: {
      backgroundColor: '#fa3534',
      borderradius: '0 15px 15px 0' ,
      height: '100%' 
    }
  }
]

//加载票夹
const GetPackages=()=>{
   request({
    url:'api/cusDetail/byUserId',
    method:'GET',
    data:{cusdUserId: UserInfo.value.id}
   }).then((res: ApiResponse)=>{
      if(res.data.status == 200){
        walletList.value = res.data.data
      }
   })
}

//加载为提交票据
const GetBills=()=>{
  request({
    url:'api/imageTest/byBillUserId',
    method:'GET',
    data:{ billUserId:UserInfo.value.id,status:0}
  }).then((res:ApiResponse)=>{
    if(res.data.status===200){
      var data = res.data.data
      BillList.value = data.map(element => ({
        billMId: element.billMId,
        itemList: element.billDetailDList.slice(0, 4),
        Addtime: element.addtime,
        billStatus: element.billStatus,
        billPhoto: baseUrl + 'file' + element.billPhoto.replace(/\\/g, '/')
      }))
      uni.$emit('updateBadge', data.length)
    }
  })
}
  //打开明细
  const OpenDetail=(item:any)=>{
    console.log(item)
    uni.navigateTo({url:`../wallet/receipt-detail?Jump=2&id=${item.billMId}`})
  }

  const OpenPack=(item:any)=>{
    const pack = encodeURIComponent(JSON.stringify(item));
    uni.navigateTo({url:`../wallet/WalletPack?pack=${pack}`})
  }

//票夹操作
const handleSwipeClick = (event: any, item: any) => {
  switch (event.index) {
    case 0: // 默认
      showLoading('设置中...')
      request({
        url:'api/cusDetail/updateIsdefault',
        method:'GET',
        data:{cusdId:item.cusdId}
      }).then((res:ApiResponse)=>{
        hideLoading()
        if(res.data.status===200){
          showSuccess('设置成功')
          GetPackages()
        }else{
          showError('设置失败')
        }
      })
      break
    case 1: // 编辑
      isEdit.value = true
      form.value = {
        companyName: item.cusdCpname,
        taxNumber: item.cusdTidn,
        editId: item.cusdId
      }
      dialogVisible.value = true
      break
    case 2: // 删除
      showModal({
        title:'提示',
        content:'确定要删除吗',
        success(res) {
            if(res.confirm){
              showLoading('删除中...')
              request({
                url:'api/cusDetail',
                method:'DELETE',
                data:[item.cusdId]
              }).then((res:ApiResponse)=>{
                hideLoading()
                if(res.statusCode === 200){
                  showSuccess('删除成功')
                  GetPackages()
                }else{
                  showError('删除失败')
                }
              })
            }
        },
      })
      break
  }
}

//预览图片
const previewImage = (Url:string)=>{
  uni.previewImage({
    urls: [Url],
    current: Url
  })
}

//票据操作
const billhandleSwipeClick = (event: any, item: any) =>{
  console.log('2222222',event)
  switch(event.index)
  {
    case 0:
      showModal({
        title:'提示',
        content:'确定要删除吗',
        success(res) {
            if(res.confirm){
              showLoading('删除中...')
              request({
                  url:`api/imageTest/deleteBillDetailM?billMid=${item.billMId}`,
                  method:'DELETE'
              }).then((res:ApiResponse)=>{
                  if(res.data.status === 200){
                      hideLoading()
                      showSuccess('删除成功')
                      GetBills()
                  }else
                  {
                      hideLoading()
                      showError('删除失败')
                  }
              })
            }
        },
      })
      break
  }
}


// 修改 addWallet 方法
const addWallet = () => {
  isEdit.value = false
  form.value = {
    companyName: '',
    taxNumber: '',
    editId: ''
  }
  dialogVisible.value = true
}

// 添加弹窗相关方法
const closeDialog = () => {
  dialogVisible.value = false
  form.value = {
    companyName: '',
    taxNumber: '',
    editId: ''
  }
}

const handleConfirm = () => {
  if (!form.value.companyName) {
    showError('请输入公司名称')
    return
  }
  if (!form.value.taxNumber) {
    showError('请输入纳税人识别号')
    return
  }

  if (isEdit.value) {
    // 编辑票夹
    showLoading('修改中...')
    request({
      url: 'api/cusDetail',
      method: 'PUT',
      data: {
        cusdId: form.value.editId,
        cusdCpname: form.value.companyName,
        cusdTidn: form.value.taxNumber
      }
    }).then((res: ApiResponse) => {
      hideLoading()
      if (res.data.status !== 500) {
        showSuccess('修改成功')
        GetPackages()
        closeDialog()
      } else {
        showError('识别号已存在')
      }
    })
  } else {
    // 添加票夹
    showLoading('添加中...')
    request({
      url: 'api/cusDetail',
      method: 'POST',
      data: {
        cusdUserId: UserInfo.value.id,
        cusdCpname: form.value.companyName,
        cusdTidn: form.value.taxNumber,
        cusdCusId:0,
        cusdId:0
      }
    }).then((res: ApiResponse) => {
      hideLoading()
      if (res.data.status !== 500) {
        showSuccess('添加成功')
        GetPackages()
        closeDialog()
      } else {
        showError('识别号已存在')
      }
    })
  }
}



// const handleSwipeOpen = (index: number) => {
//   if (currentSwipe.value === index) {
//     currentSwipe.value = -1
//   } else {
//     currentSwipe.value = index
//   }
// }

const closeSwipe = () => {
  console.log('111222')
  currentSwipebill.value = -1
  currentSwipepack.value = -1
}
</script>

<style lang="scss" scoped>

.wallet-header {
  background-color: #ffffff;
  border-radius: 15rpx;
  padding: 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 32rpx;
  color: #333;
}

.add-btn {
  display: flex;
  align-items: center;
  color: #3cc51f;
  
  .add-text {
    font-size: 35rpx;
    color: rgb(84, 135, 220);
  }
}

.wallet-list {
  margin-bottom: 20rpx;
}

.wallet-item {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx 20rpx;
  // margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // height: auto;
  padding: 20rpx;

  .left {
    display: flex;
    gap: 10rpx;
  }
  .right{
    display: flex;
    align-items: center;
  }

  .wallet-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .wallet-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .wallet-label {
    font-size: 24rpx;
    color: #999;
  }

  .wallet-tag{
    padding: 2rpx 8rpx;
    border: 2rpx solid #ff4d4f;
    color: #ff4d4f;
    font-size: 24rpx;
    border-radius: 4rpx;
    width: 25px;
  }
}
:deep(.u-swipe-action-item) {
  margin-bottom: 20rpx !important;
}

/* 输入框样式 */
:deep(.u-input) {
  background-color: #fff;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  height: 80rpx;
}

:deep(.u-input__input) {
  height: 80rpx;
  font-size: 28rpx;
  padding: 0 20rpx;
}

/* 按钮样式 */
:deep(.u-button) {
  flex: 1;
  height: 88rpx !important;
  border-radius: 0;
  margin: 0;
  border: none;
}

:deep(.u-button--plain) {
  background: #fff;
  color: #333;
  border-right: 2rpx solid #eee;
}

:deep(.u-button--primary) {
  background: #fff;
  color: #333;
}

:deep(.u-button--active) {
  opacity: 1;
  transform: none;
}

:deep(.u-input--focus) {
  background-color: #fff;
  border-color: #eee;
}

.dialog-content {
  width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.dialog-header {
  padding: 30rpx 0;
  text-align: center;
  border-bottom: none;
  
  &::after {
    display: none;
  }
}

.dialog-title {
  font-size: 32rpx;
  color: #333;
  text-align: center;
}

.dialog-body {
  padding: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.dialog-footer {
  padding: 5px;
  display: flex;
  border-top: 2rpx solid #eee;
  margin-top: 0;
}
</style>