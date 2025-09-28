// src/ConfigMaker/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ErrorHandler from '@shared/utils/ErrorHandler/ErrorHandler'
import 'vue-sonner/style.css'
import '../../assets/styles/DaisyUi.css'
import OneSDK from '@onecomme.com/onesdk'

async function initApp() {
  try {
    const pinia = createPinia()
    const app = createApp(App)

    app.use(ErrorHandler)
    app.use(pinia)
    OneSDK.ready().then(() => app.mount('#App'))
  } catch (error) {
    console.error('アプリケーションの初期化に失敗:', error)
  }
}
initApp()
