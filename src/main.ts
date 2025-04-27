import { createSSRApp } from 'vue'
import App from './App.vue'
import uviewPlus from 'uview-plus'
import commonShare from './utils/commonShare'//配置全局分享



export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  app.mixin(commonShare)
  return {
    app
  }
}
