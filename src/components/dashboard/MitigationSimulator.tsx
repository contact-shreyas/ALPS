'use client';

import React from 'react';
import { Card, Text, Grid, Flex, Button } from '@tremor/react';

export function MitigationSimulator() {
  return (
    <div className="mt-4">
      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Card>
          <Text>Shielding Percentage</Text>
          <input
            type="range"
            className="w-full mt-4"
            defaultValue={30}
            min={0}
            max={100}
            step={5}
          />
          <Text className="mt-2 text-sm text-gray-500">
            Estimated reduction in light pollution using full-cutoff shielding
          </Text>
        </Card>
        <Card>
          <Text>Retrofit Rate</Text>
          <input
            type="range"
            className="w-full mt-4"
            defaultValue={20}
            min={0}
            max={100}
            step={5}
          />
          <Text className="mt-2 text-sm text-gray-500">
            Percentage of fixtures to be replaced with 2200-2700K LEDs
          </Text>
        </Card>
      </Grid>
      
      <Flex className="mt-6 justify-end">
        <Button variant="secondary" className="mr-2">
          Reset
        </Button>
        <Button>
          Simulate
        </Button>
      </Flex>
    </div>
  );
}