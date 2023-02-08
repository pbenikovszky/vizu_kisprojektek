;(async function init() {
  const width = 900
  const height = 900
  let currentWidth = width
  let currentHeight = height
  const moveAmount = 25
  const padding = 75
  const strokeWidth = 5

  const minRadius = 1
  const maxRadius = 4

  const mapData = await d3.json('./../data/map.json')
  const stadiumData = await d3.csv('./../data/stadiums.csv')

  const zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', zoomed)

  const projection = d3
    .geoMercator()
    .scale(200)
    .translate([width / 2, height / 1.4])
  const path = d3.geoPath(projection)

  const rScale = d3
    .scaleSqrt()
    .domain([
      d3.min(stadiumData, (d) => d.Capacity),
      d3.max(stadiumData, (d) => d.Capacity)
    ])
    .range([minRadius, maxRadius])

  const svg = d3
    .select('.svg')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .on('click', reset)

  const g = svg.append('g')

  const countries = g
    .selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('fill', '#d3d3d3')
    .attr('stroke', '#666')
    .attr('d', path)

  g.selectAll('circle')
    .data(stadiumData)
    .enter()
    .append('circle')
    .attr('cx', function (d) {
      return projection([d.Longitude, d.Latitude])[0]
    })
    .attr('cy', function (d) {
      return projection([d.Longitude, d.Latitude])[1]
    })
    .attr('r', (d) => rScale(d.Capacity))
    .style('fill', '#be2727')
    .style('stroke', 'gray')
    .style('stroke-width', 0.25)
    .style('opacity', 0.75)
    .on('mouseover', (e, data) => {
      const headerText = `${data.Stadium}`
      const tooltipText = `<p>
      Home of <strong>${data.Team}</strong> <br />
      ${data.City}, capacity: ${data.Capacity}
      </p>`

      d3.select('#tooltip').select('#header').html(headerText)
      d3.select('#tooltip').select('#body').html(tooltipText)

      d3.select('#tooltip').classed('hidden', false)
    })
    .on('mouseout', () => {
      d3.select('#tooltip').classed('hidden', true)
    })

  svg.call(zoom)

  d3.selectAll('.pan').on('click', function () {
    const direction = d3.select(this).attr('id')

    switch (direction) {
      case 'north':
        currentHeight -= moveAmount
        break
      case 'south':
        currentHeight += moveAmount
        break
      case 'west':
        currentWidth -= moveAmount
        break
      case 'east':
        currentWidth += moveAmount
        break
      default:
        break
    }

    svg
      .transition()
      .attr('viewBox', [
        currentWidth - width,
        currentHeight - height,
        currentWidth,
        currentHeight
      ])
  })

  function zoomed(event) {
    const { transform } = event
    g.attr('transform', transform)
    g.attr('stroke-width', 1 / transform.k)
  }

  function reset() {
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
      )
  }
})()
