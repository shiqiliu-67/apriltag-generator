import jsPDF from "jspdf";

const TAG_CONFIG = {
  tag16h5: {
    tag_window_pixels: 6,
    tag_pixels: 6,
    tag_prefix: "tag16_05",
    tag_id_max: 29,
  },
  tag25h9: {
    tag_window_pixels: 7,
    tag_pixels: 7,
    tag_prefix: "tag25_09",
    tag_id_max: 34,
  },
  tag36h11: {
    tag_window_pixels: 8,
    tag_pixels: 8,
    tag_prefix: "tag36_11",
    tag_id_max: 586,
  },
  tagCircle21h7: {
    tag_window_pixels: 5,
    tag_pixels: 9,
    tag_prefix: "tag21_07",
    tag_id_max: 15,
  },
  tagCircle49h12: {
    tag_window_pixels: 5,
    tag_pixels: 11,
    tag_prefix: "tag49_12",
    tag_id_max: 65697,
  },
  tagCustom48h12: {
    tag_window_pixels: 6,
    tag_pixels: 10,
    tag_prefix: "tag48_12",
    tag_id_max: 42210,
  },
  tagStandard41h12: {
    tag_window_pixels: 5,
    tag_pixels: 9,
    tag_prefix: "tag41_12",
    tag_id_max: 2114,
  },
  tagStandard52h13: {
    tag_window_pixels: 6,
    tag_pixels: 10,
    tag_prefix: "tag52_13",
    tag_id_max: 48713,
  },
};

function inchToMillimeters(value) {
  return 25.4 * value;
}

function drawOnCanvasCenter(img, canvas, imgWidth, imgHeight, xShift, yShift) {
  const ctx = canvas.getContext("2d");
  // Calculate center coordinates
  const centerX = canvas.width / 2 - imgWidth / 2 + xShift;
  const centerY = canvas.height / 2 - imgHeight / 2 + yShift;
  // Draw the image at the center coordinates
  ctx.drawImage(img, centerX, centerY, imgWidth, imgHeight);
}

// Function to draw a bounding box
// function drawBoundingBoxOnPDF(doc, x, y, width, height) {
//   // doc.setLineWidth(0.2); // Set line width for rectangle border
//   // doc.setDrawColor(0); // Set color for rectangle border (black in this case)
//   // doc.setFillColor(255, 255, 255); // Set fill color for rectangle (white in this case)
//   // doc.fillStroke(); // Fill and stroke the rectangle

//   doc.rect(x, y, width, height); // Draw rectangle (x, y, width, height)
// }

export async function generateTags(config, setPdfUrl, setFreeze) {
  // const tagFamily = myDict[key] || defaultValue"tag36h11";
  // const tagIds = Array.from({ length: 16 }, (_, i) => i);
  // const tagWindowSize = 0.04;
  // const tagMargin = 0.0;
  // const tagPadding = 0.002;
  // const dpi = 200;
  // const maxCol = 4;
  // const maxRow = 4;
  // const useBorder = true;
  // const drawTagId = true;
  // const textHeight = 0.002;
  // const textMarginTop = 0.0;

  const tagFamily = config["tagFamily"];
  const tagIds = config["tagIds"].filter(
    (num) => num >= 0 && num <= TAG_CONFIG[tagFamily].tag_id_max
  );
  const tagWindowSize = config["tagWindowSize"];
  const tagMargin = config["tagMargin"];
  const tagPadding = config["tagPadding"];
  const dpi = config["dpi"];
  const maxCol = config["maxCol"];
  const maxRow = config["maxRow"];
  const useBorder = config["useBorder"];
  const drawTagId = config["drawTagId"];
  const textHeight = config["textHeight"];
  const textMarginTop = config["textMarginTop"];
  const pageWidthInch = config["pageWidth"];
  const pageHeightInch = config["pageHeight"];
  console.log(
    tagFamily,
    tagIds,
    tagWindowSize,
    tagMargin,
    tagPadding,
    dpi,
    maxCol,
    maxRow,
    useBorder,
    drawTagId,
    textHeight,
    textMarginTop
  );

  // Calculate page and canvas dimensions
  // const pageWidthInch = 8.5;
  // const pageHeightInch = 11;
  // const pageMargin = 0.5;
  const pageWidth = inchToMillimeters(pageWidthInch);
  const pageHeight = inchToMillimeters(pageHeightInch);
  // const canvasWidth = Math.round(pageWidthInch * dpi);
  // const canvasHeight = Math.round(pageHeightInch * dpi);

  // Scale for converting between meters and pixels
  // const scale = canvasWidth / pageWidth;

  // Get tag configuration
  const tagWindowPixels = TAG_CONFIG[tagFamily].tag_window_pixels;
  const tagPixels = TAG_CONFIG[tagFamily].tag_pixels;
  const tagPrefix = TAG_CONFIG[tagFamily].tag_prefix;

  // Ensure tag full size fits on page
  const tagSize = (tagWindowSize / tagWindowPixels) * tagPixels;
  const tagFullSize = tagSize + 2 * tagMargin + 2 * tagPadding;

  if (tagFullSize >= pageWidth || tagFullSize >= pageHeight) {
    alert("Tag size exceeds page limit.");
    setPdfUrl("");
    setFreeze(false);
    return;
    // throw new Error("Tag size exceeds page dimensions.");
  }

  // compute the number of column and number of rows
  const nCol = Math.min(maxCol, Math.floor(pageWidth / tagFullSize));
  const nRow = Math.min(maxRow, Math.floor(pageHeight / tagFullSize));
  const nTotal = nCol * nRow;

  // Array to hold generated pages
  // const pages = [];
  const pdf = new jsPDF({
    unit: "mm",
    format: [pageWidth, pageHeight],
  });
  // Loop through tagIds to generate images
  for (
    let pageIndex = 0;
    pageIndex < Math.ceil(tagIds.length / nTotal);
    pageIndex++
  ) {
    if (pageIndex !== 0) {
      pdf.addPage();
      // pdf.addPage({ format: [pageWidth, pageHeight] }); // Add a new page for each image except the first one
    }
    // Create a canvas for each page
    // const pageCanvas = document.createElement("canvas");
    // pageCanvas.width = canvasWidth;
    // pageCanvas.height = canvasHeight;
    // const pageCtx = pageCanvas.getContext("2d");

    // Initialize variables for tag placement
    let currentRow = 0;
    let currentCol = 0;

    // Loop through each tag to place on the page
    for (
      let tagIdx = pageIndex * nTotal;
      tagIdx < Math.min(tagIds.length, (pageIndex + 1) * nTotal);
      tagIdx++
    ) {
      const tagId = tagIds[tagIdx];

      // Load tag image using Image object
      const tagFilename = `${tagPrefix}_${String(tagId).padStart(5, "0")}.png`;
      const tagPath = `${process.env.PUBLIC_URL}/apriltag_imgs/${tagFamily}/${tagFilename}`;
      const tagImg = new Image();
      tagImg.src = tagPath;
      console.log(tagImg.src);
      await new Promise((resolve) => {
        tagImg.onload = resolve;
      });
      // console.log("load image");
      // Put the image on canvas and crop it if needed
      // let tagCanvas = document.createElement("canvas");
      // let imgSize;
      // if (["tag16h5", "tag25h9", "tag36h11"].includes(tagFamily)) {
      //   tagCanvas.height = tagWindowSize * scale;
      //   tagCanvas.width = Math.round(tagCanvas.height);
      //   imgSize = Math.round(tagSize * scale);
      // } else {
      //   tagCanvas.height = Math.round(tagSize * scale);
      //   tagCanvas.width = tagCanvas.height;
      //   imgSize = Math.round(tagSize * scale);
      // }
      // drawOnCanvasCenter(tagImg, tagCanvas, imgSize, imgSize, 0, 0);
      //   console.log(tagCanvas.toDataURL("image/png"));

      // Get center of each tag on the page
      const pageCenterX = pageWidth / 2;
      const pageCenterY = pageHeight / 2;
      const xShift = (currentCol - (nCol - 1) / 2) * tagFullSize;
      const yShift = (currentRow - (nRow - 1) / 2) * tagFullSize;
      const s = tagSize;
      const x = pageCenterX + xShift - s / 2;
      const y = pageCenterY + yShift - s / 2;
      // pdf.setPage(pageIndex + 1);
      // console.log(pageIndex);
      // pdf.addPage();
      pdf.addImage(tagImg, x, y, s, s);
      // console.log(s);

      // Add border of the tag if required
      if (useBorder) {
        if (tagFamily.includes("Circle")) {
          const borderSize = tagFullSize - tagMargin * 2;
          const x = pageCenterX + xShift;
          const y = pageCenterY + yShift;
          pdf.circle(x, y, borderSize / 2);
        } else {
          const borderSize = tagFullSize - tagMargin * 2;
          const x = pageCenterX + xShift - borderSize / 2;
          const y = pageCenterY + yShift - borderSize / 2;
          pdf.rect(x, y, borderSize, borderSize); // Draw rectangle (x, y, width, height)
        }
      }

      // Draw tag id
      if (drawTagId) {
        // const ctx = pageCanvas.getContext("2d");
        const borderSize = tagSize;
        const textString = `${tagFamily} [${tagId}]`;
        pdf.setFontSize(1.0);
        pdf.setTextColor("#A9A9A9");
        const stringHeight = pdf.getTextDimensions(textString).h;
        const fontSize = textHeight / stringHeight;

        const x = pageCenterX + xShift;
        const y =
          pageCenterY + yShift + borderSize / 2 + textMarginTop + textHeight;

        pdf.setFontSize(fontSize);
        pdf.text(textString, x, y, { align: "center" });
      }
      // Put the tag canvas on image canvas

      //   // Create a canvas for tag
      //   const tagCanvas = document.createElement("canvas");
      //   tagCanvas.width = tagCanvas.height = tagCanvasSize;
      //   const tagCtx = tagCanvas.getContext("2d");

      //   // Draw tag image on tagCanvas
      //   tagCtx.drawImage(tagImg, 0, 0, tagCanvasSize, tagCanvasSize);
      //   console.log(tagCanvas.toDataURL("image/png"));

      //   // Example: Add text to tagCanvas
      //   tagCtx.font = `${Math.round(20 * scale)}px Arial`;
      //   tagCtx.fillStyle = "black";
      //   tagCtx.fillText(`Tag ID: ${tagId}`, 10 * scale, 30 * scale);

      //   // Example: Add border to tagCanvas
      //   tagCtx.strokeStyle = "black";
      //   tagCtx.lineWidth = 2 * scale;
      //   tagCtx.strokeRect(0, 0, tagCanvasSize, tagCanvasSize);

      //   // Calculate position to place tag on pageCanvas
      //   const offsetX =
      //     currentCol * tagFullSize * scale + (pageMargin + tagMargin) * scale;
      //   const offsetY =
      //     currentRow * tagFullSize * scale + (pageMargin + tagMargin) * scale;

      //   // Draw tagCanvas on pageCanvas
      //   pageCtx.drawImage(tagCanvas, offsetX, offsetY);

      // Move to next column or row
      currentCol++;
      if (currentCol >= nCol) {
        currentCol = 0;
        currentRow++;
      }
    }

    // Push the generated pageCanvas into pages array
    // pages.push(pageCanvas);
    // console.log(pageCanvas.toDataURL("image/png"));
    // const imgData = pageCanvas.toDataURL("image/png");

    // pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  }
  // return pdf;
  setPdfUrl(pdf.output("datauristring"));
  setFreeze(false);
  // pdf.save("test.pdf");
  // return URL.createObjectURL(pdfBlob);
  // const blob = new Blob([pdfBytes], { type: "application/pdf" });

  // Create a new Blob URL
  // const url = URL.createObjectURL(blob);
  // console.log(pdfUrl);
}

// Call the function to generate tags
// generateTags();
