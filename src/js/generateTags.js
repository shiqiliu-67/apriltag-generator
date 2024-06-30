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

export async function generateTags(config, setPdfUrl, setTagJson, setFreeze) {
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
  // console.log(
  //   tagFamily,
  //   tagIds,
  //   tagWindowSize,
  //   tagMargin,
  //   tagPadding,
  //   dpi,
  //   maxCol,
  //   maxRow,
  //   useBorder,
  //   drawTagId,
  //   textHeight,
  //   textMarginTop
  // );

  // Calculate page size
  const pageWidth = inchToMillimeters(pageWidthInch);
  const pageHeight = inchToMillimeters(pageHeightInch);

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
    setTagJson("");
    setFreeze(false);
    return;
  }

  // compute the number of column and number of rows
  const nCol = Math.min(maxCol, Math.floor(pageWidth / tagFullSize));
  const nRow = Math.min(maxRow, Math.floor(pageHeight / tagFullSize));
  const nTotal = nCol * nRow;

  // create an pdf to place april tags
  const pdf = new jsPDF({
    unit: "mm",
    format: [pageWidth, pageHeight],
  });

  // create an dictionary to storage all coordinated of tags
  const tagCoordinates = [];

  // Loop through tagIds to generate images
  for (
    let pageIndex = 0;
    pageIndex < Math.ceil(tagIds.length / nTotal);
    pageIndex++
  ) {
    // Add a new page for each image except the first one
    if (pageIndex !== 0) {
      pdf.addPage();
    }
    tagCoordinates.push([]);

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
      let tagPath;
      if (["tag16h5", "tag25h9", "tag36h11"].includes(tagFamily)) {
        tagPath = `${process.env.PUBLIC_URL}/apriltag_imgs/${tagFamily}/${tagFilename}`;
      } else {
        tagPath = `https://raw.githubusercontent.com/AprilRobotics/apriltag-imgs/master/${tagFamily}/${tagFilename}`;
      }
      const tagImg = new Image();
      tagImg.src = tagPath;
      console.log(tagImg.src);
      await new Promise((resolve) => {
        tagImg.onload = resolve;
      });

      // Get center of each tag on the page
      const pageCenterX = pageWidth / 2;
      const pageCenterY = pageHeight / 2;
      const xShift = (currentCol - (nCol - 1) / 2) * tagFullSize;
      const yShift = (currentRow - (nRow - 1) / 2) * tagFullSize;
      const s = tagSize;
      const x = pageCenterX + xShift - s / 2;
      const y = pageCenterY + yShift - s / 2;
      pdf.addImage(tagImg, x, y, s, s);

      // add tag coordinates
      tagCoordinates[pageIndex].push({
        id: tagId,
        family: tagFamily,
        windowSize: tagWindowSize,
        center: [xShift, -yShift],
        corners: [
          [xShift - s / 2, -yShift + s / 2],
          [xShift + s / 2, -yShift + s / 2],
          [xShift + s / 2, -yShift - s / 2],
          [xShift - s / 2, -yShift - s / 2],
        ],
      });

      // Add border of the tag if required
      if (useBorder) {
        if (tagFamily.includes("Circle")) {
          // Draw a Circle around the tag
          const borderSize = tagFullSize - tagMargin * 2;
          const x = pageCenterX + xShift;
          const y = pageCenterY + yShift;
          pdf.circle(x, y, borderSize / 2); //
        } else {
          // Draw a Square around the tag
          const borderSize = tagFullSize - tagMargin * 2;
          const x = pageCenterX + xShift - borderSize / 2;
          const y = pageCenterY + yShift - borderSize / 2;
          pdf.rect(x, y, borderSize, borderSize); // Draw rectangle (x, y, width, height)
        }
      }

      // Draw tag id
      if (drawTagId) {
        const borderSize = tagSize;
        const textString = `${tagFamily} [${tagId}]`;
        pdf.setFontSize(1.0);
        pdf.setTextColor("#A9A9A9"); // Dark gray
        const stringHeight = pdf.getTextDimensions(textString).h;
        const fontSize = textHeight / stringHeight;

        const x = pageCenterX + xShift;
        const y =
          pageCenterY + yShift + borderSize / 2 + textMarginTop + textHeight;

        pdf.setFontSize(fontSize);
        pdf.text(textString, x, y, { align: "center" });
      }

      // Move to next column or row
      currentCol++;
      if (currentCol >= nCol) {
        currentCol = 0;
        currentRow++;
      }
    }
  }
  // return generated pdf and tag coordinates through React hook
  setTagJson(JSON.stringify({ tagCoordinates }));
  setPdfUrl(pdf.output("datauristring"));
  setFreeze(false);
}
