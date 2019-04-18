import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Loading from 'vue-loading-overlay';
import JsonExcel from 'vue-json-excel';
import App from './App.vue';

import 'bootstrap';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.use(VueAxios, axios);
Vue.component('Loading', Loading);
Vue.component('downloadExcel', JsonExcel);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
