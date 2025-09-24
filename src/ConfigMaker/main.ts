// src/ConfigMaker/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ErrorHandler from '@shared/utils/ErrorHandler/ErrorHandler'
import App from './App.vue'

async function initApp() {
  try {
    const pinia = createPinia()
    const app = createApp(App)

    app.use(ErrorHandler)
    app.use(pinia)
    app.mount('#App')
  } catch (error) {
    console.error('アプリケーションの初期化に失敗:', error)
  }
}
initApp()
