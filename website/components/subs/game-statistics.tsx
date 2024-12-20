'use client';

import { Card, Text, Flex, Grid } from '@radix-ui/themes';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components';
import { LineChart, BarChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import gameStatsData from '@/data/game_statistics.json';

// Register the required components
echarts.use([
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LineChart,
  BarChart,
  CanvasRenderer,
  UniversalTransition
]);

interface GameStatisticsProps {
  gameTitle: string;
}

export function GameStatistics({ gameTitle }: GameStatisticsProps) {
  const gameData = gameStatsData.games[gameTitle.toLowerCase() as keyof typeof gameStatsData.games];

  return (
    <Grid columns="6" gap="4" p="6">
      {gameData.stats.map((stat, index) => (
        <Card key={index} style={{ gridColumn: 'span 2' }}>
          <Flex direction="column" gap="2">
            <Text size="2" weight="bold" className="font-pixel">
              {stat.label}
            </Text>
            <Text size="6" className="font-pixel">
              {stat.value}
            </Text>
          </Flex>
        </Card>
      ))}

      <Card style={{ gridColumn: 'span 6', maxWidth: '1000px', padding: '1rem' }}>
        <div className="space-y-4 text-lg">
          {gameTitle === 'Call of Duty' && (
            <>
              <p className="text-justify">
                Each game of the emblematic franchise has been a success.
                Even those considered less impactful still outperform many other games in the industry.
                This cornerstone of war games acts as a unifier for the broader shooter community.
                Whether your main game is Overwatch, Battlefield, or Doom, you have likely seen Call of Duty content in your feed.
              </p>
              <p className="text-justify">
                The dedication rate, defined as the proportion of channels that have the game as their primary focus (highest number of videos published by a channel)
                compared to all channels that have posted at least one video about the game, is about 40%.
                This illustrates the diversity of its audience: even if CoD isn’t the primary game for many creators,
                its gravitational pull ensures that almost everyone in the shooter community engages with it at some point.
              </p>
            </>
          )}

          {gameTitle === 'Fortnite' && (
            <>
              <p className="text-justify">
                While CoD is a long-standing franchise originating from the early 2000s, Fortnite is a standalone phenomenon.
                Released in July 2017, it marked a turning point for gaming on YouTube, revolutionizing how communities form and interact.
                Unlike CoD’s steady presence, Fortnite experienced a huge rise that reshaped the platform’s landscape.

              </p>
              <p className="text-justify">
                At its peak, it seemed like every content creator was uploading Fortnite videos, so much that it has become the main game for more than half the channels playing it.
                This explosive growth clustered a variety of communities around the same game, creating an unprecedented level of cross-viewers interactions.
                This does not totally mean that the game was adopted by everyone, as the likes to dislikes ratio is decent but lower than CoD’s.
              </p>
            </>
          )}

          {gameTitle === 'Minecraft' && (
            <>
              <p className="text-justify">
                The most popular video game of all time claims the crown.
                Its unmatched versatility appeals to those seeking creativity, exploration, survival, or combat to only name a few.
                It's impossible to draw up a profile of the typical Minecraft player or viewer, because they simply don't exist.
              </p>
              <p className="text-justify">
                More than 10% of gaming videos on YouTube feature Minecraft, and for half of the channels uploading Minecraft content, it stands as their primary focus.
                This timeless and polyvalent game captivates a massive audience on the platform.
                To top it off, its popularity is further validated by the great appreciation reflected in viewers' likes.

              </p>
            </>
          )}
        </div>
      </Card>
    </Grid>
  );
}

