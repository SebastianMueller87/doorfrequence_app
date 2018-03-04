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
      data: [
        'test',
        'test2'
      ],
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

    updateGraph (data) {
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
              series: [{
                  name: 'Öffnungen',
                  data: data,
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
                }
              }]
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
      let data = new Array(24).fill(0)

      this.openingData.forEach((item, index) => {
        let date = moment.unix(item.timestamp / 1000)
        if (date.hour() !== 6)
          data[date.hour()]++
      })

      return data
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
