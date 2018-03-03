import Vue from 'vue'

// mount application
window.app = new Vue({
  el: '#app',
  render: h => h(require('./components/index.vue'))
})
