<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info" @click="Login">
      <view class="avatar-section">
        <img class="avatar" :src="defaultAvatarUrl" />
        <view class="user-text">
          <span v-if="needAuth" class="please-login">请先登录</span>
          <span v-else class="nickname">{{ userInfo.nickName }}</span>
          <view v-if="!needAuth" class="Nick-Phone" @click.stop="openEditPhone">
            <u-icon name="phone-fill" size="20" color="rgb(84, 135, 220)"></u-icon>
            <span class="phone">{{ userInfo.phone||'请填写手机号' }}</span>
            <u-icon name="edit-pen" size="20" color="rgb(84, 135, 220)"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <view 
        v-for="item in functionList" 
        :key="item.type"
        class="function-item"
        @click="handleFunction(item.type)"
      >
        <view class="left">
          <u-icon :name="item.icon" color="rgb(84, 135, 220)" size="30"/>
          <span style="margin-left: 10px;">{{ item.name }}</span>
        </view>
        <u-icon class="arrow-icon" name="arrow-right" color="rgb(84, 135, 220)" size="30"></u-icon>
      </view>
    </view>

    <u-popup
      :show="showEditPhone"
      @close="closeEditPhone"
      :closeOnClickOverlay="true"
      :safeAreaInsetBottom="false"
      mode="center"
      :round="10"
    >
      <view class="edit-phone-popup">
        <view class="edit-phone-title">修改手机号</view>
        <view class="edit-phone-content">
          <u-input
            v-model="newPhone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            :border="true"
            class="phone-input"
          ></u-input>
        </view>
        <view class="edit-phone-footer">
          <button class="cancel-btn" @click="closeEditPhone">取消</button>
          <button class="confirm-btn" @click="confirmEditPhone">确认</button>
        </view>
      </view>
    </u-popup>

    <!-- 认证弹窗 -->
    <u-popup 
    :show="ShowUserInfo" 
    @close="closeDialog" 
    :closeOnClickOverlay="true"
    :safeAreaInsetBottom="true"
    :customStyle="{
      paddingBottom: '20px'
    }"
  >
    <view class="auth-popup">
      <view class="auth-header">
        <view style="display: flex;margin-left: 0px;">
          <u-icon :name="mainimage" size="30" ></u-icon>
          <text class="auth-title">锐信云·票据申请</text>
        </view>
        <text class="auth-subtitle">获取你的头像、昵称和手机号</text>
        <text class="auth-desc">展示个人信息</text>
      </view>

      <view class="auth-content">
        <view class="auth-item">
          <text class="label">头像：</text>
          <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onchooseAvatar">
            <image class="avatar" :src="form.avatar || defaultAvatarUrl" mode="aspectFill"/>
            <u-icon name="arrow-right" color="rgb(84, 135, 220)" size="30"></u-icon>
          </button>
        </view>

        <view class="auth-item">
          <text class="label">昵称：</text>
          <u-input
            type="nickname"
            v-model="form.nickname"
            placeholder="请输入昵称"
            :border="false"
            class="auth-input"
          ></u-input>
        </view>

        <view class="auth-item">
          <text class="label">手机号：</text>
          <u-input
            v-model="form.phone"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
            :border="false"
            class="auth-input"
          ></u-input>
        </view>
      </view>

      <view class="auth-footer">
        <button class="auth-btn" @click="handleConfirm">完成</button>
      </view>
    </view>
    </u-popup>
    <uni-tabbar></uni-tabbar>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow,onLoad } from '@dcloudio/uni-app'
import {Userconfig,envconfig} from '@/config';
import request from '@/utils/request'
import type { ApiResponse } from '@/utils/api'
import { hideLoading, showError, showLoading, showSuccess, showToast } from '@/utils/ShowTips';


const {baseUrl} = Userconfig();
const envbaseUrl = envconfig().baseUrl

// 定义响应式数据
const userInfo = ref({
  id: 0,
  nickName:'',
  phone: '',
  avatar:''
});
const code = ref('');
const ShowUserInfo = ref(false);
const functionList = ref([
  { name: '票夹', icon: 'coupon-fill', type: 'TickPack' },
  { name: '退出', icon: '/static/icons/image.png', type: 'Layout' }
]);
const defaultAvatarUrl = ref(envbaseUrl+'file/uploaded_images/system/headimage.png');
const mainimage = ref(envbaseUrl+'file//uploaded_images/system/mainimage.png');
const needAuth=ref(true)
const showEditPhone = ref(false);
const newPhone = ref('');

// 添加表单数据
const form = ref({
  avatar: '',
  nickname: '',
  phone: ''
})

// 页面显示时触发
onMounted(() => {
  // 这里可根据需求添加逻辑
});
onLoad(()=>{
  uni.$emit('updateTab', '/pages/my/my')
  const token= uni.getStorageSync('access_token')
  if(token){
    const user= uni.getStorageSync('UserInfo')
    userInfo.value = formatPhone(user)
    console.log(formatPhone(user.phone))
    needAuth.value = false;
  }
})
onShow(()=>{
  uni.$emit('updateTab', '/pages/my/my')
  const token= uni.getStorageSync('access_token')
  if(token){
    const user= uni.getStorageSync('UserInfo')
    userInfo.value = formatPhone(user)
    console.log(formatPhone(user.phone))
    needAuth.value = false;
  }
})

// 登录函数
const Login = () => {
 showLoading('登录中...');
  uni.login({
    success:(res)=>{
      uni.request({
          url: envbaseUrl+'api/userManage/getOpenId',
          method: 'GET',
          data: {
              code: res.code
          }
      }).then((res:ApiResponse) => {
          code.value = res.data.data;
          uni.request({
              url: envbaseUrl+'api/userManage/queryByBillUserWxId',
              method: 'GET',
              data: {
                  billUserWxId: code.value
              }
          }).then((res:ApiResponse) => {
              if (Object.keys(res.data.data).length === 0) {
                  ShowUserInfo.value = true;
                hideLoading();
              } else {
                  getOnLogin();
              }
          }).catch(() => {
            hideLoading();
            showError('登录失败');
          });
      }).catch(() => {
        hideLoading();
        showError('登录失败');
      });
    }
  })
};

// 登录成功后处理
const getOnLogin = () => {
  uni.request({
      url: envbaseUrl+`api/userManage/createUserManage?billUserNickname=&billUserPhone=&billUserWxId=${code.value}`,
      method: 'POST'
  }).then((res:ApiResponse) => {
      if (res.statusCode === 200) {
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
          userInfo.value = formatPhone(UserInfo)
          needAuth.value = false
          GetBills()
          hideLoading();
          showSuccess('登录成功');
      }
  }).catch((err) => {
     showError({ title: '登录失败', icon: 'error' });
  });
};

// 处理功能点击
const handleFunction = (type) => {
  switch (type) {
      case 'TickPack':
          uni.switchTab({url:'../wallet/wallet'});
          break;
      case 'Layout':
        needAuth.value = true
        userInfo.value = {
          id: 0,
          nickName:'',
          phone: '',
          avatar:''
        }
        uni.$emit('updateBadge', 0)
        uni.$emit('updateList')
        uni.$emit('updatemsg')
        uni.removeStorageSync('access_token')
        uni.removeStorageSync('UserInfo')
        uni.removeStorageSync('Loggedby')
         showSuccess('退出成功');
          break;
  }
};

const closeDialog=()=>{
  ShowUserInfo.value=false
}

// 选择头像
const onchooseAvatar = (e) => {
  console.log(e)
  const { avatarUrl } = e.detail;
  form.value.avatar = avatarUrl
}

// 确认提交
const handleConfirm = () => {
  if (!form.value.nickname) {
    showToast('请输入昵称')
    return
  }
  console.log(form.value.phone)
  if (form.value.phone.length !==0 && !/^1[3-9]\d{9}$/.test(form.value.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  showLoading('登录中...')
  uni.uploadFile({
    filePath: form.value.avatar,
    name: 'photo',
    url: envbaseUrl+`api/userManage/createUserManage?billUserNickname=${form.value.nickname}&billUserPhone=${form.value.phone||''}&billUserWxId=${code.value}`,
    header:{
      'content-type': 'multipart/form-data'
    },
    success:((res)=>{
       if(res.statusCode == 200){
        form.value = {
          avatar: '',
          nickname: '',
          phone: ''
        }
        closeDialog()
        getOnLogin();
       }
    })
  })
}

// 打开编辑手机号弹窗
const openEditPhone = () => {
  showEditPhone.value = true;
  const user= uni.getStorageSync('UserInfo')
  newPhone.value = user.phone
};

// 关闭编辑手机号弹窗
const closeEditPhone = () => {
  showEditPhone.value = false;
  newPhone.value = '';
};

// 确认修改手机号
const confirmEditPhone = () => {
  if (!/^1[3-9]\d{9}$/.test(newPhone.value)) {
    showToast('请输入正确的手机号');
    return;
  }
  
  showLoading('修改中...');
  request({
    url:'api/userManage/updateUserById',
    method:'PUT',
    data:{billUserPhone:newPhone.value ,userId:userInfo.value.id}
  }).then((res:ApiResponse)=>{
    hideLoading()
    if(res.data.status == 200){
      const user= uni.getStorageSync('UserInfo')
      user.phone = newPhone.value
      userInfo.value.phone = newPhone.value
      uni.setStorageSync('UserInfo', user)
      userInfo.value = formatPhone(userInfo.value)
      showSuccess('修改成功')
    }else(
      showError('修改失败')
    )
  }).catch(()=>{
     hideLoading()
     showError('修改失败')
  })

  closeEditPhone();
};

  // 获取未处理票据数量
const GetBills=()=>{
  request({
    url:'api/imageTest/byBillUserId',
    method:'GET',
    data:{ billUserId:userInfo.value.id,status:0}
  }).then((res:ApiResponse)=>{
    if(res.data.status===200){
      var data = res.data.data
      uni.$emit('updateBadge', data.length)
    }
  })
}
  //转换手机号
const  formatPhone=(user:any)=>{
    const { phone } = user;
    if (phone) {
      const formatted = phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
      user.phone = formatted;
    }
    return user;
}

</script>

<style lang="scss" scoped>
.user-info {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  height: 80px;
  background-image: linear-gradient(to bottom, #edeff1, #dfe3eb, #cbcdcf);
}

.avatar-section {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.please-login,
.nickname {
  font-size: 40rpx;
  color: #333;
  margin-bottom: 6rpx;
}

.Nick-Phone {
  display: flex;
  align-items: center;
}


.phone {
  font-size: 28rpx;
  color: #999;
}

.headset-icon {
  width: 50rpx;
  height: 50rpx;
}

.function-list {
  // background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.function-item {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 5px;
}

.function-item:last-child {
  border-bottom: none;
}

.left {
  display: flex;
  align-items: center;
}

.func-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.arrow-icon {
  width: 32rpx;
  height: 32rpx;
}

.left span {
  font-size: 28rpx;
  color: #333;
}

.auth-popup {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
}

.auth-header {
  margin-bottom: 30rpx;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.auth-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.auth-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 6rpx;
}

.auth-desc {
  font-size: 24rpx;
  color: #999;
}

.auth-avatar {
  margin-bottom: 20rpx;
}

.avatar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatar-right {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
}

.default-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.auth-nickname,
.auth-phone {
  margin-bottom: 20rpx;
}

.confirm-btn {
  background-color: rgb(143, 243, 130);
  border-radius: 40rpx;
  border: none;
  color: white;
  height: 100rpx;
  width: 200rpx;
  margin: 40rpx auto 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-popup {
  // width: 600rpx;
  background-color: #fff;
  // border-radius: 20rpx;
  padding: 40rpx 30rpx;
}

.auth-header {
  display: flex;
  flex-direction: column;
  // align-items: center;
  margin-bottom: 40rpx;
}

.auth-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
}

.auth-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.auth-desc {
  font-size: 24rpx;
  color: #999;
}

.auth-content {
  padding: 0 20rpx;
}

.auth-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #eee;

  .label {
    width: 120rpx;
    font-size: 28rpx;
    color: #333;
    text-align: right;
  }

  .avatar-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: none; border: none; padding: 0; margin: 0; line-height: normal; outline: none;
    &::after {  // 移除微信按钮的默认边框
      display: none;
    }
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
    }
  }
}

.auth-input {
  flex: 1;
  font-size: 28rpx;
}

:deep(.u-input__input) {
  height: 80rpx;
  font-size: 28rpx;
}

.auth-footer {
  margin-top: 60rpx;
  display: flex;
  justify-content: center;
}

.auth-btn {
  width: 240rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #07c160;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
}

.edit-phone-popup {
  // width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  
  .edit-phone-title {
    text-align: center;
    font-size: 32rpx;
    font-weight: 500;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;
  }
  
  .edit-phone-content {
    padding: 30rpx;
    
    :deep(.phone-input) {
      .u-input__input {
        height: 80rpx;
        font-size: 28rpx;
        background-color: #fff;
        padding: 0 20rpx;
      }
    }
  }
  
  .edit-phone-footer {
    display: flex;
    border-top: 1rpx solid #eee;
    
    button {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      font-size: 28rpx;
      background: #fff;
      border: none;
      margin: 0;
      padding: 0;
      
      &::after {
        display: none;
      }
    }
    
    .cancel-btn {
      color: #666;
      border-right: 1rpx solid #eee;
    }
    
    .confirm-btn {
      color: #07c160;
    }
  }
}
</style>