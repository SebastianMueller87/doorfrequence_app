const Highcharts = require('highcharts')

export default class HighchartsHelper {
  static createGraph (myData, highchartsContainer, period) {
    const self = this

    let xAxisText = 'Uhr'
    xAxisText = period ? `Uhr <br>Zeitraum: ${period.start} bis ${period.end}` : xAxisText

    return Highcharts.chart(`${highchartsContainer}`, {
        chart: { type: 'column' },
        title: { text: '' },
        xAxis: {
            title: {
              text: xAxisText
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
          formatter: function () { return self.formatTooltip(this.points, myData) }
        },
        series: [{
            name: 'Türaktionen',
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
  }

  static formatTooltip (points, myData) {
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
  }
}
