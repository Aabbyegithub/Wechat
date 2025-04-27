<template>
  <view class="container" style="max-height: calc(100vh-100px);">
    <!-- 第一个表单容器 -->
    <view class="form-container">
      <view class="input-group">
        <view v-for="item in head" :key="item.id" class="input-item">
          <span class="label">
            {{ item.billTdName }}<span class="required">*</span>：
          </span>
          <input 
            class="input"
            :disabled="Jump ==3"
            :placeholder="'请输入'+ item.billTdName"
            :value="item.billTypeValue"
            @input="onInput(item,$event)"
            data-section="head"
          />
        </view>
      </view>
    </view>

    <!-- 第二个表单容器 -->
    <view class="form-container" style="margin-top:10px">
      <view class="input-group">
        <!-- 必填项 -->
        <view v-for="item in body" :key="item.id" class="input-item">
          <span class="label">
            {{ item.billTdName }}<span class="required">*</span>：
          </span>
          <input 
            class="input"
            :disabled="Jump ==3"
            :placeholder="'请输入'+ item.billTdName"
            :value="item.billTypeValue"
            data-section="body"
            @input="onInput(item,$event)"
          />
        </view>

        <!-- 选填项 -->
        <view v-for="item in end" :key="item.id" class="input-item">
          <span class="label">{{ item.billTdName }}：</span>
          <input 
            class="input"
            :disabled="Jump ==3"
            :placeholder="'请输入'+ item.billTdName"
            :value="item.billTypeValue"
            data-section="end"
            @input="onInput(item,$event)"
          />
        </view>

        <!-- 手机号输入项 -->
        <view class="input-item">
          <span class="label">手机号：</span>
          <input 
            class="input"
            :disabled="Jump !=3"
            placeholder="请输入票据归属人手机号"
            :value="billUserPhone"
            data-section="phone"
            @input="onInput(billUserPhone,$event)"
          />
          <img 
            v-if="Jump !=3"
            class="photo"
            :src="photo"
            @click="ChooseContact"
          />
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="form-container" v-if="Jump !=3">
      <view class="submit-btn-wrapper">
        <button class="submit-btn" @click="handleSubmit">提交</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow,onLoad } from '@dcloudio/uni-app'
import  request  from '@/utils/request'
import { showLoading, hideLoading, showModal, showToast, showError, showSuccess } from '@/utils/ShowTips'
import  {envconfig}  from '@/config'
import type { ApiResponse } from '@/utils/api'

// 响应式数据
const UserInfo = ref()
const head = ref([])
const body = ref([])
const end = ref([])
const billMid = ref('')
const Jump = ref()
const billUserPhone = ref('')
const photo = ref(envconfig().baseUrl + 'file/uploaded_images/system/phoneimage.png')

// 生命周期钩子
onLoad((options) => {
  showLoading('加载中...')
  UserInfo.value = uni.getStorageSync('UserInfo')
  Jump.value = options.Jump
  billMid.value = options.id
  GetBillDetial()
  hideLoading()
})

// 方法定义
const GetBillDetial = async () => {
    request({
      url: 'api/imageTest/bybillMId',
      method: 'GET',
      data: { billMid: billMid.value }
    }).then((res:ApiResponse)=>{
      if (res.statusCode === 200) {
        head.value = res.data.data.head
        body.value = res.data.data.body
        end.value = res.data.data.end
        billUserPhone.value = res.data.data.billUserPhone
      }
    })
}

//监听输入
const onInput=(item: any, event: Event)=>{
  const target = event.target as HTMLInputElement;
  if(target.dataset.section === 'head'){
    const index = head.value.findIndex(element => element.billTdName === item.billTdName);
    if (index!== -1) {
        head.value[index].billTypeValue = target.value;
    }
  }
  if(target.dataset.section === 'body'){
    const index = body.value.findIndex(element => element.billTdName === item.billTdName);
    if (index!== -1) {
      body.value[index].billTypeValue = target.value;
    }
  }
  if(target.dataset.section === 'end'){
    const index = end.value.findIndex(element => element.billTdName === item.billTdName);
    if (index!== -1) {
      end.value[index].billTypeValue = target.value;
    }
  }
  if(target.dataset.section === 'phone'){
    billUserPhone.value = target.value
  }
}
const ChooseContact = () => {
  uni.chooseContact({
    success: (res) => {
      billUserPhone.value = res.phoneNumber || ''
    },
    fail: (err) => {
      if (err.errMsg.indexOf('auth deny') !== -1) {
        showModal({
          content: '需要授权访问通讯录才能使用此功能, 鸿蒙系统设置，找到微信应用，开启通讯录权限。',
          showCancel: false
        })
      }
    }
  })
}

const handleSubmit = () => {
  if(billUserPhone.value === undefined ){
    billUserPhone.value = UserInfo.value.phone
  }
  let isSaveMsg = '';
  const Savebody = [];
  isSaveMsg = validateAndAddData(head.value, isSaveMsg, Savebody);
  isSaveMsg = validateAndAddData(body.value, isSaveMsg, Savebody);
  for (const item of end.value) {
      Savebody.push({
          billDid: item.billDid,
          billTdName: item.billTdName,
          billTypeValue: item.billTypeValue
      });
  }

  // 检查是否有错误信息
  if (isSaveMsg.length!== 0) {
      showToast(isSaveMsg);
      return;
  } 
  showLoading('提交中...')
  request({
    url:`api/imageTest/UpdateByIds?billMid=${billMid.value}&billUserPhone=${billUserPhone}`,
    method:'PUT',
    data:Savebody
  }).then((res:ApiResponse)=>{
    hideLoading()
    if(res.data.status == 200){
       showSuccess('提交成功')
        setTimeout(() => {
            if(Jump.value == 1)
              uni.switchTab({url:'../index/index'})      
            if(Jump.value == 2)
              uni.switchTab({url:'../wallet/wallet'})
          }, 1000);          
        }
        else
        showError('提交失败')
  }).catch(()=>{
    hideLoading()
    showError('提交失败')
  })
}

const validateAndAddData =(arr, isSaveMsg, Savebody) =>{
    for (const item of arr) {
        if (item.billTypeValue.length === 0) {
            isSaveMsg += `${item.billTdName}不能为空`;
            break;
        }
        Savebody.push({
            billDid: item.billDid,
            billTdName: item.billTdName,
            billTypeValue: item.billTypeValue
        });
    }
    return isSaveMsg;
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
}

.form-container {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 10rpx;
}

.input-group {
  margin-bottom: 20rpx;
}

.input-item {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.label {
  width: 100px;
  font-size: 28rpx;
  color: #333;
  text-align: right;
}

.required {
  color: #ff4d4f;
  margin-left: 4rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  padding: 10rpx;
  border: 2rpx solid #ebdfdf;
  border-radius: 12rpx;
  background-color: #f0e8e8;
}

.submit-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #3cc51f;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.submit-btn:active {
  opacity: 0.8;
}

.photo {
  width: 30px;
  height: 30px;
  margin-left: 10px;
}
</style>

