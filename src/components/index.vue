<template lang="pug">
  .app
    .header.text-center
      .col-12
        h1 Index.vue
      //- ul
      //-   li(v-bind:key="index" v-for="(item, index) in data")
      //-     span {{ item.timestamp }} : {{ item.value }}
      ul
        li(v-bind:key="index" v-for="(item, index) in openingPerHour")
          span {{ index }} : {{ item }}
</template>

<script>
const axios = require('axios')
const moment = require('moment')

export default {
  props: {},

  data () {
    return {
      data: [
        'test',
        'test2'
      ]
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
            this.data = Object.keys(response.data).map((key) => {
              return { timestamp: key, value: response.data[key] }
            })
        })
        .catch((error) => {
          console.error('Error: ', error)
        })
    }
  },

  computed: {
    openingData: function () {
      return this.data.filter((item, index) => {
        return item.value === 0
      })
    },
    closingData: function () {
      return this.data.filter((item, index) => {
        return item.value === 1
      })
    },
    openingPerHour: function () {
      let data = []
      this.openingData.forEach((item, index) => {
        let date = moment.unix(item.timestamp / 1000)

        if (date.hour() == 6) {
          console.log(date.format('DD.MM.YYYY hh:mm:ss'))
        }

        if (!data[date.hour()]) {
          data[date.hour()] = 1
        } else {
          data[date.hour()]++
        }
      })

      return data
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
