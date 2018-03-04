<template lang="pug">
  .app
    .header.text-center
      .col-12
        h1 Index.vue
      div(v-bind:id="this.id")
      ul
        li(v-bind:key="index" v-for="(item, index) in openingPerHour")
          span {{ index }} : {{ item }}
</template>

<script>
const axios = require('axios')
const moment = require('moment')
// const HighchartsHelper = require('../library/HighchartsHelper.js')
import HighchartsHelper from '../library/HighchartsHelper.js'
export default {
  props: {},

  data () {
    return {
      data: [],
      id: '',
    }
  },

  created () {
    this.baseUrl = 'http://192.168.178.54'
    this.port = 8000
    this.filename = 'data.json'
    console.log('Index.vue is created')
    this.id = `graph-container-${this._uid}`
    this.graphContainer = `${this.id}`

    this.fetchData()

  },

  methods: {
    fetchData () {
      axios.get(`${this.baseUrl}:${this.port}/${this.filename}`)
        .then((response) => {
            this.data = Object.keys(response.data).map((key) => {
              return { timestamp: key, value: response.data[key] }
            })
            console.log(HighchartsHelper)
            HighchartsHelper.createGraph(this.openingPerHour, this.graphContainer)
        })
        .catch((error) => {
          console.error('Error: ', error)
        })
    },

    getCountPerHour(data) {
      let returnData = Array(24).fill({})
      returnData = returnData.map((item, index) => {
        return { count: 0, duration: 0 }
      })

      // evaluate data
      data.forEach((item, index) => {
          let date = moment.unix(item.timestamp / 1000)
          // TODO remove workaround duto failed data
          if (date.hour() !== 6) {
            returnData[date.hour()].count++
            returnData[date.hour()].duration += item.duration
          }
      })

      return returnData
    },
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
      let data = this.getCountPerHour(this.dataWithDuration)

      let count = data.map((item, index) => {
        return {'count': item.count, 'duration': item.duration}
      })


      let duration = data.map((item, index) => {
        let seconds = item.duration > 0 ? item.duration / item.count : item.duration
        return seconds
      })

      return count
    },

    dataWithDuration: function () {
      let data = []

      for(let i=1; i < this.data.length - 1; i++) {
        // just evaluate from open (1) to closed (0)
        if (this.data[i].value === 1) {
          if (this.data[i].value !== this.data[i + 1].value) {
            let openingDate = moment.unix(this.data[i].timestamp / 1000)
            let closingDate = moment.unix(this.data[i + 1].timestamp / 1000)
            let duration = moment.duration(closingDate.diff(openingDate)).asSeconds()
            data.push({ value: this.data[i].value, duration: duration, timestamp: this.data[i].timestamp })
            i++
          }

        }
      }
      return data
    },
  }
}

</script>

<style lang="scss" scoped>

</style>
