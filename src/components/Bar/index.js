import React, { useRef, useEffect } from 'react'
import * as echarts from 'echarts';
function Bar ({ title, xData, yData, style}) {
    const domRef = useRef(null)
  const charInit = () => {
    const myChart = echarts.init(domRef.current)
    myChart.setOption({
      title: {
        text: title
      },
      tooltip: {},
      xAxis: {
        data: xData
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: yData
        }
      ]
    })
}

    useEffect(() => {
    charInit()
    }, [])
    return <div>
        <div ref= {domRef} style={style}>

        </div>
    </div>
}

export {Bar}