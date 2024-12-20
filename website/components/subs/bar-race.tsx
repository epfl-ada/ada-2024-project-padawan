import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { PlayIcon, PauseIcon, ResetIcon } from '@radix-ui/react-icons'

interface BarRaceProps {
  data: {
    weeks: string[]
    [key: string]: string[] | number[]
  }
  width?: number
  height?: number
}

interface RankedItem {
  name: string;
  value: number;
  rank: number;
}

interface DataItem {
  name: string;
  value: number;
  rank: number;
}

export default function BarRace({ data, width = 800, height = 500 }: BarRaceProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentFrame, setCurrentFrame] = useState(0)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!svgRef.current) return

    // Constants
    const marginTop = 16
    const marginRight = 6
    const marginBottom = 6
    const marginLeft = 100
    const barSize = 48
    const n = 12 // Show top N games
    const duration = 80
    
    // Transform data into required format
    const games = Object.keys(data).filter(key => key !== 'weeks')
    const formattedData = data.weeks.flatMap((week, i) => 
      games.map(game => ({
        date: new Date(week),
        name: game,
        value: (data[game] as number[])[i]
      }))
    )

    // Setup helper functions
    const formatNumber = d3.format(",d")
    const formatMillions = (x: number) => {
        if (x < 1000000) {
            return `${x}`
        }
        return `${(x / 1000000)}M`
    }
    const formatDate = d3.utcFormat("%d %b %Y")

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(games)

    // Setup names and date values
    const names = new Set(formattedData.map(d => d.name))
    const datevalues = Array.from(d3.rollup(formattedData, ([d]) => d.value, d => +d.date, d => d.name))
      .map(([date, data]): [Date, d3.InternMap<string, number>] => [new Date(date), data])
      .sort(([a], [b]) => d3.ascending(a, b))

    // Rank function
    const rank = (value: (name: string) => number) => {
      const data = Array.from(names, name => ({ name, value: value(name) })) as RankedItem[];
      data.sort((a, b) => d3.descending(a.value, b.value));
      for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
      return data;
    }

    // Generate keyframes
    const k = 7 // Number of keyframes per transition
    const keyframes: [Date, { name: string; value: number; rank: number }[]][] = []
    for (let i = 0; i < datevalues.length - 1; ++i) {
      const [ka, a] = datevalues[i]
      const [kb, b] = datevalues[i + 1]
      for (let t = 0; t < k; ++t) {
        const alpha = t / k
        keyframes.push([
          new Date(+ka * (1 - alpha) + +kb * alpha),
          rank(name => (a.get(name) || 0) * (1 - alpha) + (b.get(name) || 0) * alpha)
        ])
      }
    }
    keyframes.push([datevalues[datevalues.length - 1][0], rank(name => datevalues[datevalues.length - 1][1].get(name) || 0)])

    // Setup prev/next maps for transitions
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])

    // Setup scales
    const x = d3.scalePow()
      .exponent(0.5)
      .range([marginLeft, width - marginRight])
    const y = d3.scaleBand<number>()
      .domain(d3.range(n + 1))
      .rangeRound([marginTop, marginTop + barSize * (n + 1 + 0.1)])
      .padding(0.1)

    // Implementation of the bars
    const barsG = svg.append('g')
      .attr('fill-opacity', 0.6)

    // Implementation of the labels
    const labelsG = svg.append('g')
      .style('font', 'bold 12px var(--sans-serif)')
      .style('font-variant-numeric', 'tabular-nums')
      .style('fill', 'white')
      .attr('text-anchor', 'end')

    // Implementation of the axis
    const axisG = svg.append('g')
      .attr('transform', `translate(0,${marginTop})`)
    
    const axisTransition = (transition: d3.Transition<any, any, any, any>) => {
      const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()))
        .tickFormat(x => formatMillions(+x))
      
      axisG.transition(transition)
        .call(axis)
      
      axisG.select(".tick:first-of-type text").remove()
      axisG.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "white")
        .attr("stroke-opacity", 0.2)
      axisG.select(".domain").remove()
    }

    // Implementation of the ticker
    const ticker = svg.append('text')
      .style('font', `bold ${barSize}px var(--sans-serif)`)
      .style('font-variant-numeric', 'tabular-nums')
      .style('fill', 'white')
      .attr('text-anchor', 'end')
      .attr('x', width - marginRight - 6)
      .attr('y', height - marginBottom - 10)
      .attr('dy', '0.32em')

    // Modified animation function
    const animate = async () => {
      while (animationRef.current < keyframes.length) {
        const keyframe = keyframes[animationRef.current]
        const [date, data] = keyframe

        // Update x domain with some padding
        x.domain([0, data[0].value * 1.1])

        // Update axis
        axisTransition(d3.transition()
          .duration(duration)
          .ease(d3.easeLinear))

        // Update bars
        barsG.selectAll<SVGRectElement, DataItem>('rect')
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append('rect')
              .attr('fill', d => color(d.name))
              .attr('height', y.bandwidth())
              .attr('x', x(0))
              .attr('y', d => y((prev.get(d) || d).rank) ?? 0)
              .attr('width', d => x((prev.get(d) || d).value) - x(0)),
            update => update,
            exit => exit.transition()
              .duration(duration)
              .remove()
              .attr('y', d => y((next.get(d) || d).rank) ?? 0)
              .attr('width', d => x((next.get(d) || d).value) - x(0))
          )
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank) ?? 0)
          .attr('width', d => x(d.value) - x(0))

        // Update labels
        labelsG.selectAll<SVGTextElement, DataItem>('text')
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append('text')
              .attr('transform', d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
              .attr('y', y.bandwidth() / 2)
              .attr('x', -6)
              .attr('dy', '-0.25em')
              .text(d => d.name)
              .call(text => text.append('tspan')
                .attr('fill-opacity', 0.7)
                .attr('font-weight', 'normal')
                .attr('x', -6)
                .attr('dy', '1.15em')
                .text(d => formatNumber(d.value))),
            update => update,
            exit => exit.transition()
              .duration(duration)
              .remove()
          )
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr('transform', d => `translate(${x(d.value)},${y(d.rank)})`)
          .each(function(d) {
            d3.select(this)
              .select('tspan')
              .text(formatNumber(d.value));
          });

        // Update ticker
        ticker.text(formatDate(date))

        await new Promise(resolve => setTimeout(resolve, duration))

        // If last frame, reset
        if (animationRef.current === keyframes.length - 1) {
          reset()
        } else {
          setCurrentFrame(animationRef.current)
          if (isPlaying) {
            animationRef.current++
          }
        }
      }
    }

    // Reset function
    const reset = () => {
      animationRef.current = 0
      setCurrentFrame(0)
      animate()
    }

    // Start animation
    reset()

    // Cleanup
    return () => {
      svg.selectAll('*').remove()
    }
  }, [data, width, height, isPlaying])

  const handleSliderChange = (value: number) => {
    animationRef.current = value
    setCurrentFrame(value)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg ref={svgRef} />
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            animationRef.current = 0
            setCurrentFrame(0)
          }}
          className="h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label="Reset"
        >
          <ResetIcon className="h-5 w-5 text-gray-700" />
        </button>

        <div className="relative flex items-center select-none touch-none w-64 h-5">
          <div className="relative flex-grow h-[6px] rounded-full bg-gray-800/20 border border-white/20">
            <div 
              className="absolute h-full rounded-full bg-white"
              style={{ 
                width: `${(currentFrame / (data.weeks.length * 7 - 1)) * 100}%`
              }}
            />
          </div>
          <input 
            type="range"
            min={0}
            max={data.weeks.length * 7 - 1}
            value={currentFrame}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-gray-50 [&::-webkit-slider-thumb]:focus:outline-none [&::-webkit-slider-thumb]:focus:ring-4 [&::-webkit-slider-thumb]:focus:ring-gray-800/30 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:hover:bg-gray-50 [&::-moz-range-thumb]:focus:outline-none [&::-moz-range-thumb]:focus:ring-4 [&::-moz-range-thumb]:focus:ring-gray-800/30"
          />
        </div>
      </div>
    </div>
  )
}
