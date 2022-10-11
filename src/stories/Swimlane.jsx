import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { mxGraph, mxRubberband, mxClient, mxUtils, mxEvent } from "mxgraph-js";
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'stage', headerName: 'Stage', width: 130, editable: true },
    { field: 'location', headerName: 'Location', width: 130, editable: true },
    { field: 'details', headerName: 'Details', width: 500, editable: true },
    { field: 'step', headerName: 'Step', width: 70, editable: true },
    {
      field: "action",
      headerName: "",
      sortable: false,
      renderCell: (params) => {
        const onClick = (e) => {
          e.stopPropagation(); // don't select this row after clicking
  
          const api: GridApi = params.api;
          const thisRow: Record<string, GridCellValue> = {};
  
          api
            .getAllColumns()
            .filter((c) => c.field !== "__check__" && !!c)
            .forEach(
              (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
            );
          console.log(thisRow)
          const newDataGridRows = removeObjectWithId(dataGridRows, thisRow.id);
          setDataGridRows(newDataGridRows);
          return true;
        };
  
        return <DeleteIcon onClick={onClick}></DeleteIcon>;
      }
    },
  ];
  
  const defaultRows = [
    { id: 1, stage: 'Origin', location: 'External', details: 'Client Send Data: Database', step: 1 },
    { id: 2, stage: 'Collect', location: 'Organization', details: 'BA Store raw data in org library: CSV', step: 2 },
    // { id: 3, stage: 'Process', location: 'Local', details: 'Data clean and analysis: CSV', step: 3 },
    // { id: 4, stage: 'Store', location: 'Organization', details: 'Data store analysis in ORG library: googlesheet', step: 4 },
    // { id: 5, stage: 'Share', location: 'Organization', details: 'BA share the result data to stakeholder as commentator: googlesheet', step: 5 },
    // { id: 6, stage: 'Destroy', location: 'None', details: '- No Policy: -', step: 6 },
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

  useEffect(() => {
  }, [dataGridRows]);
  
  return (
    <>
      <Grid container spacing={2}>

        <Grid item xs={2}>
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
        </Grid>
        
        <Grid item xs={10}>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              experimentalFeatures={{ newEditingApi: true }}
              rows={dataGridRows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
            />
          </div>
        </Grid>

      </Grid>

      <div className="graph-container" ref={divGraph} id="divGraph" />
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