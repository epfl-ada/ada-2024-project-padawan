import { ResponsivePie } from "@nivo/pie";

// Define the type for a single pie slice
interface PieData {
  id: string;
  label: string;
  value: number; // Value as a percentage
  color: string;
}

// Define the component's props type
interface AnimatedPieChartProps {
  data: PieData[];
  showLegend: boolean;
}

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({ data, showLegend }) => {
  // Filter data for legend to show only slices greater than 5%
  const legendData = data.filter((slice) => slice.value > 5);

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
      innerRadius={0}
      padAngle={0}
      cornerRadius={0}
      activeOuterRadiusOffset={8}
      colors={{ datum: "data.color" }}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      // Disable arc link labels by setting skip angle to a very high value
      arcLinkLabelsSkipAngle={360}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      legends={
        showLegend
          ? [
              {
                anchor: "right",
                direction: "row",
                justify: false,
                translateX: 150,
                translateY: 0,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#FFFFFF",
                symbolSize: 18,
                symbolShape: "circle",
                data: legendData.map((slice) => ({
                  id: slice.id,
                  label: slice.label,
                  color: slice.color,
                })),
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]
          : []
      }
      animate={true}
      motionConfig="gentle"
    />
  );
};

export default AnimatedPieChart;
