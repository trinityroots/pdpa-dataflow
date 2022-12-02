import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { mxGraph, mxRubberband, mxClient, mxUtils, mxEvent, mxSwimlaneManager, mxStackLayout, mxLayoutManager, mxGraphModel, mxPoint, mxConstants, mxPerimeter, mxEdgeStyle } from "mxgraph-js";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { CardContent } from '@mui/material'
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

import './button.css';

/**
 * Swimlane Diagram
 */
export const Swimlane = ({ primary, backgroundColor, size, label, ...props }) => {

  function removeObjectWithId(arr, id) {
    // Making a copy with the Array from() method
    const arrCopy = Array.from(arr);
  
    const objWithIdIndex = arrCopy.findIndex((obj) => obj.id === id);
    arrCopy.splice(objWithIdIndex, 1);
    return arrCopy;
  }

  const setDiagramStyles = (graph) => {
    // Auto-resizes the container
    graph.border = 80;
    graph.getView().translate = new mxPoint(graph.border/2, graph.border/2);
    graph.setResizeContainer(true);
    graph.graphHandler.setRemoveCellsFromParent(false);

    // Changes the default vertex style in-place
    var style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    style[mxConstants.STYLE_FONTSIZE] = 11;
    style[mxConstants.STYLE_STARTSIZE] = 22;
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
    delete style[mxConstants.STYLE_FILLCOLOR];

    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_FONTSIZE] = 10;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    delete style[mxConstants.STYLE_STARTSIZE];
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
    graph.getStylesheet().putCellStyle('process', style);
    
    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    delete style[mxConstants.STYLE_ROUNDED];
    graph.getStylesheet().putCellStyle('state', style);
                    
    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_SPACING_TOP] = 40;
    style[mxConstants.STYLE_SPACING_RIGHT] = 64;
    graph.getStylesheet().putCellStyle('condition', style);
            
    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_SPACING_TOP] = 28;
    style[mxConstants.STYLE_FONTSIZE] = 14;
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    delete style[mxConstants.STYLE_SPACING_RIGHT];
    graph.getStylesheet().putCellStyle('end', style);
    
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
    
    style = mxUtils.clone(style);
    style[mxConstants.STYLE_DASHED] = true;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
    style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_OVAL;
    graph.getStylesheet().putCellStyle('crossover', style);
        
    // Installs double click on middle control point and
    // changes style of edges between empty and this value
    graph.alternateEdgeStyle = 'elbow=vertical';
    return graph;    
  }

  const drawDiagram = () => {
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
    } else {
      mxEvent.disableContextMenu(divGraph.current);
      const graph = new mxGraph(divGraph.current);
      new mxRubberband(graph);
      const parent = graph.getDefaultParent();
      var model = graph.getModel();
      setDiagramStyles(graph);
      if (graph.isEnabled()) {
        	// Allows new connections but no dangling edges
					graph.setConnectable(true);
					graph.setAllowDanglingEdges(false);
					// End-states are no valid sources
					var previousIsValidSource = graph.isValidSource;
          debugger;
					graph.isValidSource = function(cell)
					{
						if (previousIsValidSource.apply(this, arguments))
						{
							var style = this.getModel().getStyle(cell);
							
							return style == null || !(style == 'end' || style.indexOf('end') == 0);
						}

						return false;
					};
					graph.isValidTarget = function(cell)
					{
						var style = this.getModel().getStyle(cell);
						
						return !this.getModel().isEdge(cell) && !this.isSwimlane(cell) &&
							(style == null || !(style == 'state' || style.indexOf('state') == 0));
					};
					graph.setDropEnabled(true);
					graph.setSplitEnabled(false);
					graph.isValidDropTarget = function(target, cells, evt)
					{
						if (this.isSplitEnabled() && this.isSplitTarget(target, cells, evt))
						{
							return true;
						}
						
						var model = this.getModel();
						var lane = false;
						var pool = false;
						var cell = false;
						
						// Checks if any lanes or pools are selected
						for (var i = 0; i < cells.length; i++)
						{
							var tmp = model.getParent(cells[i]);
							lane = lane || this.isPool(tmp);
							pool = pool || this.isPool(cells[i]);
							
							cell = cell || !(lane || pool);
						}
						
						return !pool && cell != lane && ((lane && this.isPool(target)) ||
							(cell && this.isPool(model.getParent(target))));
					};
					graph.isPool = function(cell)
					{
						var model = this.getModel();
						var parent = model.getParent(cell);
					
						return parent != null && model.getParent(parent) == model.getRoot();
					};
					graph.model.getStyle = function(cell)
					{
						var style = mxGraphModel.prototype.getStyle.apply(this, arguments);
					
						if (graph.isCellCollapsed(cell))
						{
							if (style != null)
							{
								style += ';';
							}
							else
							{
								style = '';
							}
							
							style += 'horizontal=1;align=left;spacingLeft=14;';
						}
						
						return style;
					};
					var foldingHandler = function(sender, evt)
					{
						var cells = evt.getProperty('cells');
						
						for (var i = 0; i < cells.length; i++)
						{
							var geo = graph.model.getGeometry(cells[i]);

							if (geo.alternateBounds != null)
							{
								geo.width = geo.alternateBounds.width;
							}
						}
					};

					graph.addListener(mxEvent.FOLD_CELLS, foldingHandler);
      }

      new mxSwimlaneManager(graph);
      var layout = new mxStackLayout(graph, false);
      layout.resizeParent = true;
      layout.fill = true;
      layout.isVertexIgnored = function(vertex)
      {
        return !graph.isSwimlane(vertex);
      }
      var layoutMgr = new mxLayoutManager(graph);

      layoutMgr.getLayout = function(cell)
      {
        if (!model.isEdge(cell) && graph.getModel().getChildCount(cell) > 0 &&
          (model.getParent(cell) == model.getRoot() || graph.isPool(cell)))
        {
          layout.fill = graph.isPool(cell);
          
          return layout;
        }
        
        return null;
      };

      model.beginUpdate();

      try {
        var pool1 = graph.insertVertex(parent, null, 'Pool 1', 0, 0, 640, 0);
        pool1.setConnectable(false);

        var lane1a = graph.insertVertex(pool1, null, 'Lane A', 0, 0, 640, 110);
        lane1a.setConnectable(false);

        var lane1b = graph.insertVertex(pool1, null, 'Lane B', 0, 0, 640, 110);
        lane1b.setConnectable(false);

        var pool2 = graph.insertVertex(parent, null, 'Pool 2', 0, 0, 640, 0);
        pool2.setConnectable(false);

        var lane2a = graph.insertVertex(pool2, null, 'Lane A', 0, 0, 640, 140);
        lane2a.setConnectable(false);

        var lane2b = graph.insertVertex(pool2, null, 'Lane B', 0, 0, 640, 110);
        lane2b.setConnectable(false);
        
        var start1 = graph.insertVertex(lane1a, null, null, 40, 40, 30, 30, 'state');
        var end1 = graph.insertVertex(lane1a, null, 'A', 560, 40, 30, 30, 'end');
        
        var step1 = graph.insertVertex(lane1a, null, 'Contact\nProvider', 90, 30, 80, 50, 'process');
        var step11 = graph.insertVertex(lane1a, null, 'Complete\nAppropriate\nRequest', 190, 30, 80, 50, 'process');
        var step111 = graph.insertVertex(lane1a, null, 'Receive and\nAcknowledge', 385, 30, 80, 50, 'process');
        
        var start2 = graph.insertVertex(lane2b, null, null, 40, 40, 30, 30, 'state');
        
        var step2 = graph.insertVertex(lane2b, null, 'Receive\nRequest', 90, 30, 80, 50, 'process');
        var step22 = graph.insertVertex(lane2b, null, 'Refer to Tap\nSystems\nCoordinator', 190, 30, 80, 50, 'process');
        
        var step3 = graph.insertVertex(lane1b, null, 'Request 1st-\nGate\nInformation', 190, 30, 80, 50, 'process');
        var step33 = graph.insertVertex(lane1b, null, 'Receive 1st-\nGate\nInformation', 290, 30, 80, 50, 'process');
        
        var step4 = graph.insertVertex(lane2a, null, 'Receive and\nAcknowledge', 290, 20, 80, 50, 'process');
        var step44 = graph.insertVertex(lane2a, null, 'Contract\nConstraints?', 400, 20, 50, 50, 'condition');
        var step444 = graph.insertVertex(lane2a, null, 'Tap for gas\ndelivery?', 480, 20, 50, 50, 'condition');
        
        var end2 = graph.insertVertex(lane2a, null, 'B', 560, 30, 30, 30, 'end');
        var end3 = graph.insertVertex(lane2a, null, 'C', 560, 84, 30, 30, 'end');
        
        var e = null;
        
        graph.insertEdge(lane1a, null, null, start1, step1);
        graph.insertEdge(lane1a, null, null, step1, step11);
        graph.insertEdge(lane1a, null, null, step11, step111);
        
        graph.insertEdge(lane2b, null, null, start2, step2);
        graph.insertEdge(lane2b, null, null, step2, step22);
        graph.insertEdge(parent, null, null, step22, step3);
        
        graph.insertEdge(lane1b, null, null, step3, step33);
        graph.insertEdge(lane2a, null, null, step4, step44);
        graph.insertEdge(lane2a, null, 'No', step44, step444, 'verticalAlign=bottom');
        graph.insertEdge(parent, null, 'Yes', step44, step111, 'verticalAlign=bottom;horizontal=0;labelBackgroundColor=white;');
        
        graph.insertEdge(lane2a, null, 'Yes', step444, end2, 'verticalAlign=bottom');
        e = graph.insertEdge(lane2a, null, 'No', step444, end3, 'verticalAlign=top');
        e.geometry.points = [new mxPoint(step444.geometry.x + step444.geometry.width / 2,
          end3.geometry.y + end3.geometry.height / 2)];
        
        graph.insertEdge(parent, null, null, step1, step2, 'crossover');
        graph.insertEdge(parent, null, null, step3, step11, 'crossover');
        e = graph.insertEdge(lane1a, null, null, step11, step33, 'crossover');
        e.geometry.points = [new mxPoint(step33.geometry.x + step33.geometry.width / 2 + 20,
              step11.geometry.y + step11.geometry.height * 4 / 5)];
        graph.insertEdge(parent, null, null, step33, step4);
        graph.insertEdge(lane1a, null, null, step111, end1);
      } finally {
        graph.getModel().endUpdate();
      }
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'stage', headerName: 'Stage', width: 130, editable: true },
    { field: 'location', headerName: 'Location', width: 130, editable: true },
    { field: 'details', headerName: 'Details', width: 200, editable: true },
    { field: 'step', headerName: 'Step', width: 70, editable: true }
    // {
    //   field: "action",
    //   headerName: "",
    //   sortable: false,
    //   renderCell: (params) => {
    //     const onClick = (e) => {
    //       e.stopPropagation(); // don't select this row after clicking
  
    //       const api: GridApi = params.api;
    //       const thisRow: Record<string, GridCellValue> = {};
  
    //       api
    //         .getAllColumns()
    //         .filter((c) => c.field !== "__check__" && !!c)
    //         .forEach(
    //           (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
    //         );
    //       console.log(thisRow)
    //       const newDataGridRows = removeObjectWithId(dataGridRows, thisRow.id);
    //       setDataGridRows(newDataGridRows);
    //       return true;
    //     };
  
    //     return <DeleteIcon onClick={onClick}></DeleteIcon>;
    //   }
    // },
  ];
  
  const defaultRows = [
    { id: 1, stage: 'Origin', location: '', details: '', step: 1 },
    { id: 2, stage: 'Collect', location: '', details: '', step: 2 },
    { id: 3, stage: 'Process', location: '', details: '', step: 3 },
    { id: 4, stage: 'Store', location: '', details: '', step: 4 },
    { id: 5, stage: 'Share', location: '', details: '', step: 5 },
    { id: 6, stage: 'Destroy', location: '', details: '', step: 6 },
  ];

  const defaultValues = {
    id: 0,
    stage: "",
    location: "",
    details: "",
    step: 0,
  };

  const [formValues, setFormValues] = useState(defaultValues)
  const [dataGridRows, setDataGridRows] = useState(defaultRows)
  const divGraph = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleAddStep = () => {
    setDataGridRows([...dataGridRows, formValues])
  };

  useEffect(() => {
    drawDiagram()
  });

  useEffect(() => {
  }, [dataGridRows]);
  
  return (
    <>
      <Grid container spacing={2}>

        {/* <Grid item xs={2}>
          <Card variant="outlined" style={{ height: 400 }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Add a Step
              </Typography>
              <FormControl fullWidth>
                <Grid container direction={"column"} spacing={2} alignItems="center" fullWidth>
                <Grid item>
                    <TextField
                      id="id-input"
                      name="id"
                      label="ID"
                      type="number"
                      value={formValues.id}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>                
                  <Grid item>
                    <TextField
                      id="stage-input"
                      name="stage"
                      label="Stage"
                      type="text"
                      value={formValues.stage}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <TextField 
                      id="location-input"
                      name="location"
                      label="Location"
                      type="text"
                      value={formValues.location}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <TextField 
                      id="details-input"
                      name="details"
                      label="Details"
                      type="text"
                      value={formValues.details}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <TextField 
                      id="step-input"
                      name="step"
                      label="Step"
                      type="number"
                      value={formValues.step}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="primary" onClick={handleAddStep}>
                      Add Step
                    </Button>
                  </Grid>
                </Grid>
              </FormControl>
            </CardContent>
          </Card>
        </Grid> */}
        
        <Grid item xs={4}>
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              experimentalFeatures={{ newEditingApi: true }}
              rows={dataGridRows}
              columns={columns}
              pageSize={6}
              rowsPerPageOptions={[6]}
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