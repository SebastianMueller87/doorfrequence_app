<template lang="pug">
  .app
    .header.text-center
      .col-12
        h1 Index.vue
      ul
        li(v-bind:key="index" v-for="(entry, index) in data")
          span {{index}} : {{entry}}
</template>

<script>
const axios = require('axios')

export default {
  props: {},

  data () {
    return {
      data: {}
    }
  },

  created () {
    this.baseUrl = 'http://192.168.178.54'
    this.port = 8000
    this.filename = 'data.json'
    console.log('Index.vue is created')

    this.fetchData()
  },

  methods: {
    fetchData () {
      axios.get(`${this.baseUrl}:${this.port}/${this.filename}`)
        .then((response) => {
            console.log(response.data)
            console.log(Object.keys(response.data).length)
            this.data = response.data
        })
        .catch((error) => {
          console.error('Error: ', error)
        })
    }
  },

  computed: {}
}

</script>

<style lang="scss" scoped>

</style>
