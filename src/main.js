import Vue from 'vue'
import App from './App.vue'
import mobileFont from './mobileFont'
mobileFont(window, window.lib || (window.lib = {}))
import Vant from 'vant';
import 'vant/lib/vant-css/index.css';

Vue.use(Vant);
new Vue({
  el: '#app',
  render: h => h(App)
})
