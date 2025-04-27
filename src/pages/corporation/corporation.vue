<template>
    <div class="container">
      <div class="list">
        <div 
          v-for="item in listItems" 
          :key="item.cusdId"
          class="list-item"
          @click="handleItemClick(item)"
        >
          <span class="item-text">{{ item.cusdCpname }}</span>
        </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { onShow,onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import request from '@/utils/request'
import type { ApiResponse } from '@/utils/api'
import { hideLoading, showError, showLoading, showSuccess } from '@/utils/ShowTips'
  
const listItems = ref([])
const UserInfo=ref()

onLoad(()=>{
  showLoading('加载中...')
    UserInfo.value = uni.getStorageSync('UserInfo')
    GetPackages()
    hideLoading()
})

// 刷新数据的方法
const refreshData = async () => {
  try {
    await Promise.all([
      GetPackages()
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

  
  //获取票夹
const GetPackages=()=>{
    request({
        url:'api/cusDetail/byUserId',
        method:'GET',
        data:{cusdUserId:UserInfo.value.id}
    }).then((res:ApiResponse)=>{
        if(res.data.status === 200){
          listItems.value = res.data.data
        }
        else{
          showError('加载失败')
        }
    }).catch(()=>{showError('加载失败')})
}
  const handleItemClick = (item:any) => {
    const Loggedby = {
      id:item.cusdId,
      name:item.cusdCpname,
      cusdTidn:item.cusdTidn
    }
    uni.setStorageSync('Loggedby',Loggedby)
    uni.switchTab({url:'../index/index'})
  }
 </script>
  
  <style lang="scss" scoped>
  .container {
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .list {
    background-color: #fff;
    margin-top: 2rpx;
  }
  
  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
  }
  
  .list-item:last-child {
    border-bottom: none;
  }
  
  .item-text {
    font-size: 28rpx;
    color: #333;
  }
  
  .item-right {
    display: flex;
    align-items: center;
  }
  </style>