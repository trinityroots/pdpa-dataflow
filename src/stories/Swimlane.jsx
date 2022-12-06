import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { mxGraph, mxRubberband, mxClient, mxUtils, mxEvent, mxCell, mxSwimlaneManager, mxStackLayout, mxLayoutManager, mxGraphModel, mxPoint, mxConstants, mxPerimeter, mxEdgeStyle } from "mxgraph-js";
import { DataGrid } from '@mui/x-data-grid';
import Grid from "@material-ui/core/Grid";

import './button.css';

/**
 * Swimlane Diagram
 */
export const Swimlane = ({ primary, backgroundColor, size, label, ...props }) => {

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'stage', headerName: 'Stage', width: 130, editable: false },
    { field: 'location', headerName: 'Location', width: 130, editable: true, type: "singleSelect", valueOptions: ["External", "Organization", "Local", "None"]},
    { field: 'details', headerName: 'Details', width: 200, editable: true },
    { field: 'step', headerName: 'Step', width: 70, editable: true, type: "singleSelect", valueOptions: [0, 1, 2, 3, 4, 5, 6] }
  ];
  
  const defaultRows = [
    { id: 1, stage: 'Origin', location: 'None', details: '', step: 1 },
    { id: 2, stage: 'Collect', location: 'None', details: '', step: 2 },
    { id: 3, stage: 'Process', location: 'None', details: '', step: 3 },
    { id: 4, stage: 'Store', location: 'None', details: '', step: 4 },
    { id: 5, stage: 'Share', location: 'None', details: '', step: 5 },
    { id: 6, stage: 'Destroy', location: 'None', details: '', step: 6 },
  ];

  const [dataGridRows, setDataGridRows] = useState(defaultRows);

  
  const dataGridRowsRef = useRef();
  dataGridRowsRef.current = dataGridRows;
  const divGraph = useRef(null);

  const _setStyles = (graph) => {
    var style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    style[mxConstants.STYLE_FONTSIZE] = 20;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.WORD_WRAP] = 'break-word';
    delete style[mxConstants.STYLE_FILLCOLOR];

    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
  }

  const _drawCFBkg = (graph, layer, size, start) => {
    if (!start) {
      start = 20;
    }
    var gridItems = [];
    for (let i = 0; i < 4; i++){
      for (let j = 0; j < 6; j++){
        gridItems.push({
            loc: i,
            phase: j,
            x: start + (size * i),
            y: start + (size * j / 2),
            size: size,
            vertex: graph.insertVertex(layer, null, null, start + (size * i), start + (size * j / 2), size , size / 2)
          });
      }
    }
    // Add Vertical Text elements
    var vertOffset = 35;
    graph.insertVertex(layer, null, 'Origin', start - 100, start + vertOffset, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Collect', start - 100, start + (size / 2) + vertOffset, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Process', start - 100, start + (size * 2 / 2) + vertOffset, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Store', start - 100, start + (size * 3 / 2) + vertOffset, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Share', start - 100, start + (size * 4 / 2) + vertOffset, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Destroy', start - 100, start + (size * 5 / 2) + vertOffset, 80, 30, 'strokeColor=none');

    // Add Horizontal Text elements
    var horOffset = 60;
    graph.insertVertex(layer, null, 'External', start + horOffset, start - 50, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Organization', start + size + horOffset, start - 50, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'Local', start + (size * 2) + horOffset, start - 50, 80, 30, 'strokeColor=none');
    graph.insertVertex(layer, null, 'None', start + (size * 3) + horOffset, start - 50, 80, 30, 'strokeColor=none');

    return gridItems;
  }

  const _drawDiagram = (graph, layer, objects, grid) => {

    var xDef = {
      'Origin': 0,
      'Collect': 1,
      'Process': 2,
      'Store': 3,
      'Share': 4,
      'Destroy': 5
    };

    var yDef = {
      'External': 0,
      'Organization': 1,
      'Local': 2,
      'None': 3 
    };

    const positions = [];
    for (let i = 0; i < objects.length; i++) {
      
      let result = grid.find(g => {
        let x = xDef[objects[i].stage]
        let y = yDef[objects[i].location]
        return (g.phase === x && g.loc === y)
      })
      debugger;
      positions.push({
        x: result.x,
        y: result.y,
        size: result.size
      });
    }

    var vertexes = [];
    for (let i = 0; i < objects.length; i++) {
      vertexes.push(graph.insertVertex(layer, null, objects[i].details, positions[i].x + (positions[i].size / 5), positions[i].y + (positions[i].size / 10), 140, 60, 'fontSize=15'));
    }
    
    for (let i = 0; i < vertexes.length - 1; i++) {
      graph.insertEdge(layer, null, '', vertexes[i], vertexes[i+1], 'strokeWidth=3;strokeColor=black');
    }
  }

  const drawDiagram = (dataGridRows) => {
    
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported())
    {
      // Displays an error message if the browser is not supported.
      mxUtils.error('Browser is not supported!', 200, false);
    }
    else
    {
      // create a copy
      var copiedDataGridRows = JSON.parse(JSON.stringify(dataGridRows));
      copiedDataGridRows.sort((a, b) => a.step > b.step ? 1 : -1)
      // clear drawing div
      if(divGraph.current.children.length){
        divGraph.current.removeChild(divGraph.current.children[0]);
      }
      // Disables the built-in context menu
      mxEvent.disableContextMenu(divGraph.current);
      // Add 2 layers
      var root = new mxCell();
      var layer0 = root.insert(new mxCell());
      var layer1 = root.insert(new mxCell()); 
      var model = new mxGraphModel(root);

      var graph = new mxGraph(divGraph.current, model);
      // Set graph uneditable
      // graph.setEnabled(false)
      // Auto resizes container
      graph.setResizeContainer(true);

      graph.alternateEdgeStyle = 'elbow=vertical';
      // Enables rubberband selection
      new mxRubberband(graph);
      // Gets the default parent for inserting new cells. This
      // is normally the first child of the root (ie. layer 0).
      // var parent = graph.getDefaultParent();
      // Adds cells to the model in a single step
      graph.getModel().beginUpdate();
      try {
        _setStyles(graph);
        var gridItems = _drawCFBkg(graph, layer0, 240, 200);
        _drawDiagram(graph, layer1, copiedDataGridRows, gridItems);
      }
      finally {
        // Updates the display
        graph.getModel().endUpdate();        
      }
    }
  }

  const updateDataGridRows = (newRow, oldRow) => {
    var copiedDataGridRows = JSON.parse(JSON.stringify(dataGridRows));
    const idx = copiedDataGridRows.findIndex((obj) => obj.id === newRow.id);
    copiedDataGridRows.splice(idx, 1);
    copiedDataGridRows.push(newRow);
    copiedDataGridRows.sort((a, b) => a.id > b.id ? 1 : -1);
    setDataGridRows(copiedDataGridRows);
    return newRow;
  };

  const updateProcessError = (error) => {
    console.log(error);
  };

  useEffect(() => {
    drawDiagram(dataGridRows)
  }, [dataGridRows]);
  
  return (
    <>
      <Grid container spacing={2}>
        
        <Grid item xs={6}>
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              experimentalFeatures={{ newEditingApi: true }}
              rows={dataGridRows}
              columns={columns}
              pageSize={6}
              rowsPerPageOptions={[6]}
              processRowUpdate={updateDataGridRows}
              onProcessRowUpdateError={updateProcessError}
            />
          </div>
        </Grid>

      </Grid>
      <Grid item xs={4}>
        <div className="graph-container" ref={divGraph} id="divGraph" />
      </Grid>
    </>
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