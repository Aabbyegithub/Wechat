
<script setup lang="ts">
import { onLaunch, onHide } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { hideLoading, showError, showLoading, showSuccess, showToast } from './utils/ShowTips'
import request from './utils/request'
import type { ApiResponse } from './utils/api'
import {Userconfig,envconfig} from './config'
const {baseUrl} = Userconfig()
const envbaseUrl = envconfig().baseUrl
const code = ref()
onLaunch(() => {
  console.log('App Launch')
  AutomaticLogin()
})

//判断短时间内是否已经登录过，自动登录
const AutomaticLogin = () => {
  const token = uni.getStorageSync('access_token')
  if(token){
    showLoading('登录中...')
    uni.login({
    provider: 'weixin',
    success: (res) => {
      uni.request({
        url: envbaseUrl+'api/userManage/getOpenId',
        method: 'GET', 
        data: {
          code: res.code 
        }
      }).then((res :ApiResponse) => {
        if(res.statusCode !==500){
          code.value = res.data.data
          uni.request({
            url: envbaseUrl+'api/userManage/queryByBillUserWxId',
            method: 'GET',
            data: {
              billUserWxId: code.value
            } 
          }).then((res :ApiResponse) => {
            if(res.statusCode !==500){
              getOnLogin()
            }else{
              err()
            }
          }).catch(()=>{
            err()
            })
        }else{
          err()
        }
      }).catch(()=>{
        err()
      })
    },
    fail: (err) => {
      err()
    }
  })
  }
}

// 获取用户信息
const getOnLogin =()=>{
  uni.request({
    url: envbaseUrl+`api/userManage/createUserManage?billUserNickname=&billUserPhone=&billUserWxId=${code.value}`,
    method: 'POST',
    }).then((res: ApiResponse) => {
      if(res.statusCode === 200){
        const Info = res.data.userManageDto;
        const UserInfo = {
              id: Info.billUserId,
              nickName: Info.billUserNickname,
              phone: Info.billUserPhone,
              avatar: 'file' + Info.billUserPhoto.replace(/\\/g, '/'),//baseUrl + 'file' + Info.billUserPhoto.replace(/\\/g, '/')
              billUserType:Info.billUserType
          };
          uni.setStorageSync('access_token',res.data.token)
          uni.setStorageSync('UserInfo',UserInfo)
          UserInfo.avatar = baseUrl+ UserInfo.avatar
          uni.setStorageSync('UserInfo',UserInfo)
        hideLoading()
        showSuccess('登录成功')
      }else{
        err()
      }
    }).catch((err)=>{
      err()
    })
  }

const err=()=>{
  hideLoading()
  uni.$emit('updateBadge', 0)
  uni.removeStorageSync('access_token')
  uni.removeStorageSync('UserInfo')
  uni.removeStorageSync('Loggedby')
  showError('登录失败')
}
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import '../node_modules/uview-plus/theme.scss';
@import '../node_modules/uview-plus/index.scss';

page {
  background-color: #f8f8f8;
  padding-bottom: 100rpx;
}

.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  // min-height: 100vh;
} 
</style>
