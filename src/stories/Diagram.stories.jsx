import React from 'react';

import { Swimlane } from './Swimlane';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Diagrams/Swimlane',
  component: Swimlane,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Swimlane {...args} />;

export const PDPA = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
PDPA.args = {
  primary: true,
  label: 'Button',
};
