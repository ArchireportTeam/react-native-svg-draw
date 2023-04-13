import React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function ThrashSvg(props: SvgProps) {
  return (
    <Svg width="25" height="25" viewBox="0 0 25 25" fill="none" {...props}>
      <Path
        d="M3.5 6.5L5.5 6.5L21.5 6.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M8.5 6.5V4.5C8.5 3.96957 8.71071 3.46086 9.08579 3.08579C9.46086 2.71071 9.96957 2.5 10.5 2.5L14.5 2.5C15.0304 2.5 15.5391 2.71071 15.9142 3.08579C16.2893 3.46086 16.5 3.96957 16.5 4.5V6.5M19.5 6.5L19.5 20.5C19.5 21.0304 19.2893 21.5391 18.9142 21.9142C18.5391 22.2893 18.0304 22.5 17.5 22.5L7.5 22.5C6.96957 22.5 6.46086 22.2893 6.08579 21.9142C5.71071 21.5391 5.5 21.0304 5.5 20.5L5.5 6.5L19.5 6.5Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M10.5 11.5L10.5 17.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M14.5 11.5L14.5 17.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
}

export default ThrashSvg;
