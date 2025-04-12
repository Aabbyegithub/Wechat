import { createSSRApp } from 'vue'
import App from './App.vue'
// 移除之前的 CSS 导入
// import '@dcloudio/uni-ui/lib/uni-popup/uni-popup.css'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
