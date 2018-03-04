<template lang="pug">
  .app
    .header.text-center
      .col-12
        h1 Öffnungen {{this.count}}
        h4 Zeitraum
          div von {{this.startDateString}}
          div bis {{this.endDateString}}
      button(v-on:click="onButtonClick()") Gesamt
      button(v-on:click="onButtonClick('week', 'this')") This Week
      button(v-on:click="onButtonClick('week', 'last')") Last Week
      button(v-on:click="onButtonClick('day', 'today')") Today
      button(v-on:click="onButtonClick('day', 'yesterday')") Yesterday
      div(v-bind:id="this.id")
</template>

<script>
import HighchartsHelper from '../library/HighchartsHelper.js'
const axios = require('axios')
const moment = require('moment')

export default {
  props: {},

  data () {
    return {
      data: [],
      id: '',
      currentData: [],
      start: null,
      end: null,
    }
  },

  created () {
    this.baseUrl = 'http://192.168.178.54'
    this.port = 8000
    this.filename = 'data.json'
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

            this.currentData = this.openingPerHour

            HighchartsHelper.createGraph(this.currentData, this.graphContainer, this.currentPeriod)
        })
        .catch((error) => {
          console.error('Error: ', error)
        })
    },

    getCountPerHour(data) {
      let returnData = Array(24).fill({})
      returnData = returnData.map((item, index) => {
        return { count: 0, duration: 0, timestamp: 0}
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

    getOpeningsWithDuration (data) {
      let filteredData = []

      for(let i=0; i < data.length - 1; i++) {
        // just evaluate from open (1) to closed (0))
        if (data[i].value === 1) {
          // find next closing dataset
          let counter = 1
          let closingData = data[i + counter]
          while (closingData.value !== 0) {
            counter++
            if (!data[i + counter]) {
              break;
            }
            closingData = data[i + counter]
          }


          let openingDate = moment.unix(data[i].timestamp / 1000)
          let closingDate = moment.unix(closingData.timestamp / 1000)
          let duration = moment.duration(closingDate.diff(openingDate)).asSeconds()
          filteredData.push({ value: data[i].value, duration: duration, timestamp: data[i].timestamp })
          i = i + counter - 1


          // Get initial start and end
          if (!this.start) {
            this.start = data[i].timestamp
          }


          if (!this.end || moment.unix(this.end/1000).isBefore(closingDate)) {
            this.end = closingData.timestamp
          }
        }
      }
      return filteredData
    },



    onButtonClick (filterPeriodType, filterPeriod) {
      if (filterPeriod && filterPeriodType) {
        if (filterPeriodType === 'week') {
          this.start = filterPeriod === 'this' ? moment().startOf('isoWeek') : moment().subtract(1, 'weeks').startOf('isoWeek')
          this.end = filterPeriod === 'this' ? moment().endOf('isoWeek') : moment().subtract(1, 'weeks').endOf('isoWeek')
        } else if (filterPeriodType === 'day') {
          this.start = filterPeriod === 'today' ? moment().startOf('day') : moment().subtract(1, 'days').startOf('day')
          this.end = filterPeriod === 'today' ? moment().endOf('day') : moment().subtract(1, 'days').endOf('day')
        }

        this.currentData = this.data.filter((item, index) => {
          return moment.unix(item.timestamp/1000).isBetween(this.start, this.end)
        })

        this.currentData = this.getCountPerHour(this.getOpeningsWithDuration(this.currentData))
      } else {
        this.currentData = this.openingPerHour
      }


      HighchartsHelper.createGraph(this.currentData, this.graphContainer, this.currentPeriod)
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
      return this.getCountPerHour(this.getOpeningsWithDuration(this.data))
    },

    count: function () {
      let count = 0
      this.currentData.map((item, index) => {
        count = count + item.count
      })
      return `${count}`
    },

    startDateString: function () {
      return `${moment.unix(this.start/1000).format('DD.MM.YYYY HH:mm:ss')}`
    },

    endDateString: function () {
      return `${moment.unix(this.end/1000).format('DD.MM.YYYY HH:mm:ss')}`
    },

    currentPeriod: function () {
      return {
        start: this.startDateString,
        end: this.endDateString,
      }
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
