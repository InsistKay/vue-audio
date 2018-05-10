import App from './App.vue'
const myComponent = {
  install: function(Vue) {
    Vue.component(App,name, App)
  }
}
// global 情况下 自动安装
if (typeof window !== 'undefined' && window.Vue) { 
    window.Vue.use(myComponent) 
}
// 导出模块
export default myComponent