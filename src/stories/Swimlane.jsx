import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { mxGraph, mxRubberband, mxClient, mxUtils, mxEvent } from "mxgraph-js";
import './button.css';

/**
 * Swimlane Diagram
 */
export const Swimlane = ({ primary, backgroundColor, size, label, ...props }) => {

  const divGraph = useRef(null);

  useEffect(() => {
    debugger;
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
    } else {
      mxEvent.disableContextMenu(divGraph.current);
      const graph = new mxGraph(divGraph.current);
      new mxRubberband(graph);
      const parent = graph.getDefaultParent();
      graph.getModel().beginUpdate();

      try {
        const v1 = graph.insertVertex(parent, null, "Hello,", 20, 20, 80, 30);
        const v2 = graph.insertVertex(parent, null, "World!", 200, 150, 80, 30);
        const e1 = graph.insertEdge(parent, null, "", v1, v2);
      } finally {
        graph.getModel().endUpdate();
      }
    }
  });
  
  return (
    <div className="graph-container" ref={divGraph} id="divGraph" />
  );
};

Swimlane.propTypes = {
  /**
   * Is this the principal call to action on the page?
   */
  primary: PropTypes.bool,
  /**
   * What background color to use
   */
  backgroundColor: PropTypes.string,
  /**
   * How large should the button be?
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * Button contents
   */
  label: PropTypes.string.isRequired,
  /**
   * Optional click handler
   */
  onClick: PropTypes.func,
};

Swimlane.defaultProps = {
  backgroundColor: null,
  primary: false,
  size: 'medium',
  onClick: undefined,
};