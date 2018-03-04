const Highcharts = require('highcharts')

module.exports.createGraph = (myData,highchartsContainer) => {
  Highcharts.chart(`${highchartsContainer}`, {
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
        formatter: function () { return formatTooltip(this.points, myData) }
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

  // inner helper function
  formatTooltip = (points, myData) => {
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
              <th>${item.series.name} 123</th>
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
