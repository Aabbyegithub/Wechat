<template>
    <view class="container" @click="closeSwipe">
      <view class="wallet-list">
        <u-swipe-action v-for="(item, index) in BillList" :key="index">
          <u-swipe-action-item 
            :options="swipebillOptions"
            @click="billhandleSwipeClick($event, item)"
            :show="currentSwipe === index"
            @open="handleSwipeOpen(index)"
          >
            <view class="wallet-item" @click="OpenDetail(item)">
              <view class="left">
                <view style="display: flex;flex-direction: column; gap: 8rpx;">
                  <text class="bill-status" style="border:2rpx solid #20f543;color: #20f543;width: 40px;font-size:24rpx;">已提交</text>
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
      <view class="no-more-data">没有更多数据喽 ~</view>
    </view>
  </template>
  
  <script setup lang="ts">
  import {  ref } from 'vue'
  import { onShow,onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import type { ApiResponse } from '@/utils/api'
  import {showLoading,hideLoading,showModal, showError, showToast, showSuccess} from '@/utils/ShowTips'
  import {Userconfig} from '@/config'
  const {baseUrl}=Userconfig()
  const UserInfo = ref()
  const BillList =ref([])
  const PackId = ref()
  
  onShow(() => {
    UserInfo.value = uni.getStorageSync('UserInfo')
    showLoading()
    GetBills()
    hideLoading()
  })
  
  onLoad((options)=>{
    const data = JSON.parse(decodeURIComponent(options.pack));
    uni.setNavigationBarTitle({title:`票夹·${data.cusdCpname}`})
    PackId.value = data.cusdId
    UserInfo.value = uni.getStorageSync('UserInfo')
    showLoading()
    GetBills();
    hideLoading()
  })

  // 刷新数据的方法
const refreshData = async () => {
  try {
    await Promise.all([
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
  
  //加载提交票据
  const GetBills=()=>{
    request({
      url:'api/imageTest/byBillCusdId',
      method:'GET',
      data:{ billCusdId:PackId.value,status:3}
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
      }
    })
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
    switch(event.index)
    {
      case 0 :
        showModal({
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
                        showToast('删除成功')
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
  
  //打开明细
  const OpenDetail=(item:any)=>{
    console.log(item)
    uni.navigateTo({url:`../wallet/receipt-detail?Jump=3&id=${item.billMId}`})
  }
  const currentSwipe = ref(-1)
  
  const handleSwipeOpen = (index: number) => {
    currentSwipe.value = index
  }
  
  const closeSwipe = () => {
    currentSwipe.value = -1
  }
  </script>
  
  <style lang="scss" scoped>  
  .wallet-list {
    margin-bottom: 20rpx;
  }
  
  .wallet-item {
    background-color: #ffffff;
    // width: 100%;  // 确保宽度填满
    border-radius: 12rpx;
    padding: 30rpx 20rpx;
    // margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: auto; // 移除固定高度，让内容自适应
    padding: 20rpx;
  
    .left {
      display: flex;
      // align-items: flex-start; // 改为顶部对齐
      gap: 10rpx;
    }
    .right{
      display: flex;
      align-items: center;
    }
  }
  .no-more-data{
    text-align: center;
    color: #999;
    font-size: 26rpx;
    padding: 30rpx 0;
  }
  :deep(.u-swipe-action-item) {
  margin-bottom: 20rpx !important;
}

  </style>