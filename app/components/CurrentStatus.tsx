import { Box, Heading, Text, useBreakpointValue } from "@chakra-ui/react";
import type { Option, Vote } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import React, { useMemo } from "react";
import type { PieLabel } from "recharts";
import { Legend } from "recharts";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#b4433a",
  "#60b14d",
  "#9751c3",
  "#b6b241",
  "#6169d8",
  "#d9943b",
  "#d971db",
  "#4bad89",
  "#dd4f93",
  "#757f38",
  "#a83f93",
  "#db582f",
  "#46aed7",
  "#de4762",
  "#6b8ed8",
  "#9d612e",
  "#7161a4",
  "#e18e76",
  "#d28dc7",
  "#a34b69",
];

type CurrentStatusProps = {
  options: SerializeFrom<(Option & {
    vote: Vote[];
  })[]>;
  closed?: boolean;
};

const RADIAN = Math.PI / 180;

const CurrentStatus: React.FC<CurrentStatusProps> = ({
  options,
  closed = false,
}) => {
  const graphOptions = useMemo(() => {
    return options.map((op) => ({ name: op.text, votes: op.vote.length }));
  }, [options]);
  const radiusAdjust = useBreakpointValue([0, 5])  

  const renderCustomizedLabel: PieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    ...rest
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
      <>
        <text
          x={x - (radiusAdjust || 0)}
          y={y - (radiusAdjust || 0)}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize='0.75rem'
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </>
    ) : null;
  };

  const renderCustomTooltip = (props: any) => {
    return (
      <Box backgroundColor="white" outline="none" p={2} rounded='md' shadow="md">
        <Heading fontSize="lg">{props?.payload[0]?.name}</Heading>
        <Text>
          {props?.payload[0]?.value} votes
        </Text>
      </Box>
    );
  };

  return (
    <Box h={['400px', '600px']} w={'full'}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            innerRadius={closed ? 0 : "40%"}
            isAnimationActive={false}
            data={graphOptions}
            dataKey="votes"
            nameKey="name"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {graphOptions.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={renderCustomTooltip} />
          <Legend fontSize="0.5rem" />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CurrentStatus;
