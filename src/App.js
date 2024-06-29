import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import { generateTags } from "./js/generateTags.js";
// import { PdfViewer } from "./components/PdfViewer.jsx";

// const PreviewContainer = styled("div")({
//   marginTop: 20,
//   textAlign: "center",
// });

function parseNumberList(str) {
  // Remove non-numeric characters (excluding commas and dashes for ranges)
  str = str.replace(/[^0-9,-]/g, "");

  let parts = str.split(","); // Split by commas

  let numbers = [];
  parts.forEach((part) => {
    if (part.includes("-")) {
      // Handle ranges
      let rangeParts = part.split("-");
      let start = parseInt(rangeParts[0].trim(), 10);
      let end = parseInt(rangeParts[1].trim(), 10);
      if (start <= end) {
        // Add numbers in the range to the array
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
      } else {
        // Add numbers in the range to the array
        for (let i = start; i >= end; i--) {
          numbers.push(i);
        }
      }
    } else {
      // Single number
      numbers.push(parseInt(part.trim(), 10));
    }
  });

  return numbers;
}

const App = () => {
  const [inputs, setInputs] = useState({
    tagFamily: "tag36h11",
    tagIds: "0, 1, 2, 5-10, 9-5",
    tagWindowSize: 4.0,
    tagMargin: 0.2,
    tagPadding: 0.4,
    textHeight: 0.3,
    textMarginTop: 0.0,
    dpi: 300,
    maxCol: 20,
    maxRow: 20,
    useBorder: true,
    drawTagId: true,
    pageWidth: 8.5,
    pageHeight: 11,
  });

  const [freeze, setFreeze] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDownload = () => {
    const config = {
      tagFamily: inputs.tagFamily,
      tagIds: parseNumberList(inputs.tagIds),
      tagWindowSize: inputs.tagWindowSize * 10,
      tagMargin: inputs.tagMargin * 10,
      tagPadding: inputs.tagPadding * 10,
      textHeight: inputs.textHeight * 10,
      textMarginTop: inputs.textMarginTop * 10,
      dpi: inputs.dpi,
      maxCol: inputs.maxCol,
      maxRow: inputs.maxRow,
      useBorder: inputs.useBorder,
      drawTagId: inputs.drawTagId,
      pageWidth: inputs.pageWidth,
      pageHeight: inputs.pageHeight,
    };
    setFreeze(true);
    generateTags(config, setPdfUrl, setFreeze);
    // const pdfBlob = pdf.output("blob");

    // Create a URL from the Blob and set it to the state
    // const url = URL.createObjectURL(pdfBlob);
    // console.log(url);
    // setPdfUrl(url);
  };

  return (
    <Container>
      <h1>AprilTag Generator</h1>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              name="tagFamily"
              value={inputs.tagFamily}
              label="Tag Family"
              onChange={handleChange}
            >
              <MenuItem value={"tag16h5"}>tag16h5</MenuItem>
              <MenuItem value={"tag25h9"}>tag25h9</MenuItem>
              <MenuItem value={"tag36h11"}>tag36h11</MenuItem>
              <MenuItem value={"tagCircle21h7"}>tagCircle21h7</MenuItem>
              <MenuItem value={"tagCircle49h12"}>tagCircle49h12</MenuItem>
              <MenuItem value={"tagCustom48h12"}>tagCustom48h12</MenuItem>
              <MenuItem value={"tagStandard41h12"}>tagStandard41h12</MenuItem>
              <MenuItem value={"tagStandard52h13"}>tagStandard52h13</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tag IDs (comma separated)"
            name="tagIds"
            value={inputs.tagIds}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tag Window Size (cm)"
            name="tagWindowSize"
            type="number"
            value={inputs.tagWindowSize}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tag Margin (cm)"
            name="tagMargin"
            type="number"
            value={inputs.tagMargin}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tag Padding (cm)"
            name="tagPadding"
            type="number"
            value={inputs.tagPadding}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tag Text Height (cm)"
            name="textHeight"
            type="number"
            value={inputs.textHeight}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tag Text Margin Top (cm)"
            name="textMarginTop"
            type="number"
            value={inputs.textMarginTop}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="DPI"
            name="dpi"
            type="number"
            value={inputs.dpi}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Max Columns"
            name="maxCol"
            type="number"
            value={inputs.maxCol}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Max Rows"
            name="maxRow"
            type="number"
            value={inputs.maxRow}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Page Width (Inch)"
            name="pageWidth"
            type="number"
            value={inputs.pageWidth}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Page Height (Inch)"
            name="pageHeight"
            type="number"
            value={inputs.pageHeight}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="drawTagId"
                checked={inputs.drawTagId}
                onChange={handleChange}
              />
            }
            label="Add Tag ID"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="useBorder"
                checked={inputs.useBorder}
                onChange={handleChange}
              />
            }
            label="Add Border"
          />
        </Grid>
      </Grid>
      <Button
        disabled={freeze}
        variant="contained"
        color="primary"
        onClick={handleDownload}
        fullWidth
        style={{ marginTop: 20, marginLeft: 0 }}
      >
        Generate
      </Button>
      {/* <PreviewContainer>
        {previewSrc && <img src={previewSrc} alt="AprilTag Preview" />}
      </PreviewContainer> */}
      {/* <PdfViewer pdf={previewSrc} /> */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          title="PDF Preview"
          style={{
            width: "100%",
            height: "150vh",
            marginTop: "20px",
            border: "1px solid #ccc",
          }}
        ></iframe>
      )}
    </Container>
  );
};

export default App;
