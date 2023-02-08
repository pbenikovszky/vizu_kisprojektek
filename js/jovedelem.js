;(async function init() {
  const width = 900
  const height = 600
  const padding = 75
  const strokeWidth = 5

  const data = (await d3.csv('./../data/jovedelem.csv')).map((data) => ({
    ...data,
    ev: +data.ev,
    osszesen: +data.osszesen.replaceAll(' ', ''),
    kor1: +data.kor1.replaceAll(' ', ''),
    kor2: +data.kor2.replaceAll(' ', ''),
    kor3: +data.kor3.replaceAll(' ', ''),
    kor4: +data.kor4.replaceAll(' ', ''),
    vegzettseg1: +data.vegzettseg1.replaceAll(' ', ''),
    vegzettseg2: +data.vegzettseg2.replaceAll(' ', ''),
    vegzettseg3: +data.vegzettseg3.replaceAll(' ', ''),
    vegzettseg4: +data.vegzettseg4.replaceAll(' ', '')
  }))

  const dataBrutto = data.filter((d) => d.jovedelemTipus == 'brutto')
  const dataset = data
    .filter((d) => d.jovedelemTipus == 'netto')
    .map((d) => {
      return {
        ...d,
        kor1Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev).kor1,
        kor2Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev).kor2,
        kor3Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev).kor3,
        kor4Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev).kor4,
        vegzettseg1Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev)
          .vegzettseg1,
        vegzettseg2Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev)
          .vegzettseg2,
        vegzettseg3Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev)
          .vegzettseg3,
        vegzettseg4Brutto: dataBrutto.find((brutto) => brutto.ev == d.ev)
          .vegzettseg4
      }
    })

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataset, function (d) {
        return d.ev
      }),
      d3.max(dataset, function (d) {
        return d.ev
      })
    ])
    .range([padding, width - padding])

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, function (d) {
        return Math.max(
          d.kor1,
          d.kor2,
          d.kor3,
          d.kor4,
          d.vegzettseg1,
          d.vegzettseg2,
          d.vegzettseg3,
          d.vegzettseg4
        )
      })
    ])
    .range([height - padding, padding])

  const color = d3.scaleOrdinal(d3.schemeCategory10)

  const lines = Array(4)
    .fill(0)
    .map((_, i) =>
      d3
        .line()
        .x(function (d) {
          return xScale(d.ev)
        })
        .y(function (d) {
          return yScale(d[`kor${i + 1}`])
        })
    )

  for (let i = 1; i < 5; i++) {
    lines.push(
      d3
        .line()
        .x(function (d) {
          return xScale(d.ev)
        })
        .y(function (d) {
          return yScale(d[`vegzettseg${i}`])
        })
    )
  }

  const svgKor = d3
    .select('.svg-kor')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const svgVegzettseg = d3
    .select('.svg-vegzettseg')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const tooltip = svgKor.append('g').style('pointer-events', 'none')

  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft().scale(yScale).ticks(10)

  for (const chart of [
    { svg: svgKor, title: 'Keresetek életkor szerint' },
    { svg: svgVegzettseg, title: 'Keresetek végzettség szerint' }
  ]) {
    chart.svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - padding) + ')')
      .call(xAxis)

    chart.svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + padding + ',0)')
      .call(yAxis)

    chart.svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 0 + padding / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', 'px')
      .style('text-decoration', 'underline')
      .text(chart.title)
  }

  for (let i = 0; i < 4; i++) {
    svgKor
      .append('path')
      .datum(dataset)
      .attr('class', 'line')
      .attr('d', lines[i])
      .attr('stroke', color(i))
      .attr('stroke-width', strokeWidth)
      .attr('fill', 'none')
      .on('mouseover', (e, d) => {
        d3.select('#tooltip').classed('hidden', false)
      })
      .on('mousemove', function (e, data) {
        const i = d3.bisectCenter(
          data.map((d) => d.ev),
          xScale.invert(d3.pointer(e)[0])
        )

        const netto = Math.floor(yScale.invert(d3.pointer(e)[1]))
        const ev = data[i].ev

        d3.select('#tooltip')
          .style('transform', `translate(${e.pageX}px, ${e.pageY}px)`)
          .select('#value')
          .html(`Nettó bér ${netto} Fr.`)
      })
      .on('mouseout', () => {
        d3.select('#tooltip').classed('hidden', true)
      })
  }

  for (let i = 4; i < 8; i++) {
    svgVegzettseg
      .append('path')
      .datum(dataset)
      .attr('class', 'line')
      .attr('d', lines[i])
      .attr('stroke', color(i))
      .attr('stroke-width', strokeWidth)
      .attr('fill', 'none')
      .on('mouseover', (e, d) => {
        d3.select('#tooltip').classed('hidden', false)
      })
      .on('mousemove', function (e, data) {
        const i = d3.bisectCenter(
          data.map((d) => d.ev),
          xScale.invert(d3.pointer(e)[0])
        )

        const netto = Math.floor(yScale.invert(d3.pointer(e)[1]))
        const ev = data[i].ev

        d3.select('#tooltip')
          .style('transform', `translate(${e.pageX}px, ${e.pageY}px)`)
          .select('#value')
          .html(`Nettó bér ${netto} Fr.`)
      })
      .on('mouseout', () => {
        d3.select('#tooltip').classed('hidden', true)
      })
  }

  const categoriesKor = [
    '25 évesnél fiatalabb',
    '25 és 54 között',
    '54 es 64 koxott',
    '65 éves és idősebb'
  ]

  const categoriesVEgzettseg = [
    'Alapfokú vagy nincs iskolai végzettsége',
    'Középfokú érettségi nélkül',
    'Középfokú érettségivel',
    'Felsőfokú'
  ]

  svgKor
    .selectAll('mydots')
    .data(categoriesVEgzettseg)
    .enter()
    .append('circle')
    .attr('cx', 100)
    .attr('cy', (d, i) => 100 + i * 25)
    .attr('r', 7)
    .attr('fill', (d, i) => color(i))

  svgKor
    .selectAll('mylabels')
    .data(categoriesVEgzettseg)
    .enter()
    .append('text')
    .attr('x', 120)
    .attr('y', (d, i) => 100 + i * 25)
    .style('fill', (d, i) => color(i))
    .text((d) => d)
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')

  svgVegzettseg
    .selectAll('mydots')
    .data(categoriesVEgzettseg)
    .enter()
    .append('circle')
    .attr('cx', 100)
    .attr('cy', (d, i) => 100 + i * 25)
    .attr('r', 7)
    .attr('fill', (d, i) => color(i + 4))

  svgVegzettseg
    .selectAll('mylabels')
    .data(categoriesVEgzettseg)
    .enter()
    .append('text')
    .attr('x', 120)
    .attr('y', (d, i) => 100 + i * 25)
    .style('fill', (d, i) => color(i + 4))
    .text((d) => d)
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')
})()
