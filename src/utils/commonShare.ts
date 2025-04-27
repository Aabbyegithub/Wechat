import {envconfig} from "@/config";
const {baseUrl} = envconfig()

export default {
  shareParams: {
    path: '/pages/index/index',
    title: '锐信云·票据'
  },
  onShareAppMessage() {
    return {
      title: this.shareParams.title,
      path: this.shareParams.path,
      imageUrl: baseUrl + 'file' + '/uploaded_images/system/Carousel1.png'
    }
  },
  onShareTimeline() {
    return {
      title: this.shareParams.title,
      path: this.shareParams.path,
      imageUrl: baseUrl + 'file' + '/uploaded_images/system/Carousel1.png'
    }
  }
}