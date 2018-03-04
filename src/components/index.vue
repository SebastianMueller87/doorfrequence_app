<template lang="pug">
  .app
    .header.text-center
      .col-12
        h1 Index.vue
      //- ul
      //-   li(v-bind:key="index" v-for="(item, index) in data")
      //-     span {{ item.timestamp }} : {{ item.value }}
      div(v-bind:id="this.id")
      ul
        li(v-bind:key="index" v-for="(item, index) in openingPerHour")
          span {{ index }} : {{ item }}
</template>

<script>
const axios = require('axios')
const Highcharts = require('highcharts')
const moment = require('moment')

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
    this.highchartsContainer = `${this.id}`

    this.fetchData()

  },

  methods: {
    fetchData () {
      axios.get(`${this.baseUrl}:${this.port}/${this.filename}`)
        .then((response) => {
            this.data = Object.keys(response.data).map((key) => {
              return { timestamp: key, value: response.data[key] }
            })

            this.updateGraph(this.openingPerHour)
        })
        .catch((error) => {
          console.error('Error: ', error)
        })
    },

    updateGraph (dataSeries) {
      Highcharts.chart(`${this.highchartsContainer}`, {
              chart: { type: 'column' },
              title: { text: '' },
              xAxis: {
                  title: {
                    text: 'Uhr'
                  },
              },
              yAxis: {
                  title: {
                      text: 'Öffnungen'
                  }
              },
              tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                  let s = '<table>'
                  this.points.map((item) => {
                    let unit = item.series.name === 'Öffnungen' ? '' : ' seconds'
                    s += '<tr><th>' + item.series.name + '</th><td style="text-align: right;">' + item.y.toFixed(2) + ' ' + unit + ' </th></tr>'
                  })

                  return s
                }
              },
              series: [{
                  name: 'Öffnungen',
                  data: dataSeries[0],
                  dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y}', // one decimal
                    y: 10, // 10 pixels down from the top
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                },
              }, {
                  name: 'Durchschnittliche Dauer',
                  data: dataSeries[1],
              }]
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
        return item.count
      })


      let duration = data.map((item, index) => {
        let seconds = item.duration > 0 ? item.duration / item.count : item.duration
        return seconds
      })

      return [count, duration]
    },

    dataWithDuration: function () {
      let data = []

      for(let i=0; i < this.data.length - 1; i++) {
        if (this.data[i].value !== this.data[i + 1].value) {
          let openingDate = moment.unix(this.data[i].timestamp / 1000)
          let closingDate = moment.unix(this.data[i + 1].timestamp / 1000)
          let duration = moment.duration(closingDate.diff(openingDate)).asSeconds()
          data.push({ value: this.data[i].value, duration: duration, timestamp: this.data[i].timestamp })
          i++
        }
      }
      return data
    },
  }
}

</script>

<style lang="scss" scoped>

</style>
