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

    updateGraph (myData) {
      let vm = this
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
                formatter: function () { return vm.formatTooltip(this.points, myData) }
              },
              series: [{
                  name: 'Öffnungen',
                  data: myData.map((item, index) => {
                    return item.count
                  }),
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
              }]
          })
    },

    formatTooltip (points, myData) {
       let s = '<table>'
        points.map((item, index) => {

          const durationInSeconds = myData[item.key].duration.toFixed(2)
          let durationString =  ''
          let minutes = Math.floor(durationInSeconds / 60)

          let seconds = (durationInSeconds - minutes * 60).toFixed(0)

          let hours = Math.floor(minutes / 60)
          minutes = hours > 0 ? (minutes - hours * 60) : minutes

          minutes = minutes < 10 ? `0${minutes}` : `${minutes}`
          seconds = seconds < 10 ? `0${seconds}`: `${seconds}`

          durationString = `${hours}:${minutes}:${seconds}`

          s += `<tr>
                  <th>${item.series.name}</th>
                  <td style="text-align: right;">${item.y}</td>
                </tr>
                <tr>
                  <th>durchschnittliche Dauer (h):</th>
                  <td style="text-align: right;">${durationString}</td>
                </tr>`
        })

        return s
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

      console.log(count)
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
