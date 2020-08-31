import React from 'react';
import {PanelProps} from '@grafana/data';
import {SimpleOptions} from 'types';
// @ts-ignore
import ReactFlow from "react-flow-renderer";
import {getTopology} from "./toplogy-parser";

interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  console.log(data)
  return (
        <ReactFlow  elements={getTopology()} style={{width: width, height: height}}/>
  );
};

