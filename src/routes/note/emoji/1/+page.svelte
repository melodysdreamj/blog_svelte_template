<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";

    // 데이터 정의, 각 프레임워크마다 국가 코드가 포함된 데이터 배열
    let data = [
        { year: 2016, Svelte: null, Vue: 51, React: 75, Angular: 56, Ember: 27 },
        { year: 2017, Svelte: null, Vue: 70, React: 71, Angular: 36, Ember: 24 },
        { year: 2018, Svelte: null, Vue: 68, React: 78, Angular: 43, Ember: 17 },
        { year: 2019, Svelte: 67, Vue: 64, React: 61, Angular: 40, Ember: 18 },
        { year: 2020, Svelte: 66, Vue: 63, React: 58, Angular: 23, Ember: 16 }
    ];

    let flags = {
        "Svelte": "🇸🇪",  // 예시: Svelte의 국기 이모티콘
        "Vue": "🇫🇷",     // 예시: Vue.js의 국기 이모티콘
        "React": "🇺🇸",   // 예시: React의 국기 이모티콘
        "Angular": "🇦🇺", // 예시: Angular의 국기 이모티콘
        "Ember": "🇩🇰"    // 예시: Ember의 국기 이모티콘
    };

    let svgWidth = 800, svgHeight = 400;
    let margin = { top: 20, right: 30, bottom: 30, left: 40 };
    let width = svgWidth - margin.left - margin.right;
    let height = svgHeight - margin.top - margin.bottom;

    onMount(() => {
        const svg = d3.select("#chart")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value));

        const frameworks = Object.keys(data[0]).slice(1);

        frameworks.forEach(framework => {
            let frameworkData = data.map(d => ({ year: d.year, value: d[framework] }));

            svg.append("path")
                .datum(frameworkData)
                .attr("fill", "none")
                .attr("stroke", color(framework))
                .attr("stroke-width", 2)
                .attr("d", line);

            // 마지막 데이터 포인트에 국기 이모티콘 추가
            const lastDataPoint = frameworkData[frameworkData.length - 1];
            svg.append("text")
                .attr("x", x(lastDataPoint.year))
                .attr("y", y(lastDataPoint.value))
                .attr("dy", "-0.5em")
                .attr("font-size", "18px")
                .text(flags[framework]);
        });

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(y));
    });
</script>

<svg id="chart"></svg>

<style>
    #chart {
        background-color: #282c34;
        color: white;
    }
</style>
