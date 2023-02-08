;(async function init() {
  const width = 1000
  const height = 1000
  const padding = 50

  const minRadius = 1
  const maxRadius = 8

  const typeFilter = document.querySelector('#typeFilter')

  const data = (await d3.csv('./../data/pokemon.csv')).map((data) => ({
    ...data,
    Speed: +data.Speed,
    Attack: +data.Attack,
    Defense: +data.Defense
  }))

  const types = ['ALL', ...new Set(data.map((d) => d.Type))].sort((a, b) =>
    a.localeCompare(b)
  )

  for (type of types) {
    const newOption = document.createElement('option')
    newOption.value = type
    newOption.innerText = type
    typeFilter.append(newOption)
  }

  const dataset = []

  for (let i = 0; i < data.length; i++) {
    if (i < data.length - 1 && data[i].Name == data[i + 1].Name) {
      dataset.push({
        ...data[i],
        Type: `${data[i].Type}/${data[i + 1].Type}`
      })
      i = i + 1
      continue
    }
    dataset.push({
      ...data[i]
    })
  }

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.Attack) + 10])
    .range([padding, width - padding])

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.Defense) + 10])
    .range([height - padding, padding])

  const rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(dataset, (d) => d.Speed)])
    .range([minRadius, maxRadius])

  const svg = d3
    .select('.svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft().scale(yScale).ticks(5)

  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + (height - padding) + ')')
    .call(xAxis)

  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis)

  draw(dataset)

  typeFilter.addEventListener('change', (e) => {
    const selectedType = e.target.value
    if (selectedType == 'ALL') {
      draw(dataset)
      return
    }
    const filteredDataset = dataset.filter((d) => d.Type.includes(selectedType))
    draw(filteredDataset)
  })

  function draw(dataset) {
    svg
      .selectAll('circle')
      .remove()
      .exit()
      .data(dataset)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.Attack))
      .attr('cy', (d) => yScale(d.Defense))
      .attr('r', (d) => rScale(d.Speed))
      .attr('stroke-width', (d) => rScale(d.Speed) / 2)
      .attr('fill', (d) => {
        const type = d.Type.split('/')[0]
        return getColorByType(type)
      })
      .attr('stroke', (d) => {
        const types = d.Type.split('/')
        return getColorByType(types[types.length - 1])
      })
      .on('mouseover', (d) => {
        var xPosition = xScale(d.Attack)
        var yPosition = yScale(d.Defense)

        d3.select('#tooltip')
          .style('left', xPosition + 'px')
          .style('top', yPosition + 'px')

        d3.select('#tooltip').select('#header').text(d.Name)
        d3.select('#tooltip').select('#value').text(d.Type)

        d3.select('#tooltip').classed('hidden', false)
      })
      .on('mouseout', () => {
        d3.select('#tooltip').classed('hidden', true)
      })
  }

  function getColorByType(type) {
    switch (type) {
      case 'FIRE':
        return '#F08030'
        break
      case 'WATER':
        return '#6890F0'
        break
      case 'GRASS':
        return '#78C850'
        break
      case 'ELECTRIC':
        return '#F8D030'
        break
      case 'ICE':
        return '#98D8D8'
        break
      case 'FIGHTING':
        return '#C03028'
        break
      case 'POISON':
        return '#A040A0'
        break
      case 'GROUND':
        return '#E0C068'
        break
      case 'FLYING':
        return '#A890F0'
        break
      case 'PSYCHIC':
        return '#F85888'
        break
      case 'BUG':
        return '#A8B820'
        break
      case 'ROCK':
        return '#B9A038'
        break
      case 'GHOST':
        return '#705898'
        break
      case 'DARK':
        return '#705848'
        break
      case 'DRAGON':
        return '#7038F8'
        break
      case 'STEEL':
        return '#B8B8D0'
        break
      case 'FAIRY':
        return '#F0B6BC        '
        break
      default:
        return '#A8A878'
    }
  }
})()
