const TAG_CONFIG = {
  tag16h5: {
    tag_window_pixels: 6,
    tag_pixels: 8,
    tag_prefix: "tag16_5",
  },
  tag25h9: {
    tag_window_pixels: 7,
    tag_pixels: 9,
    tag_prefix: "tag25_9",
  },
  tag36h11: {
    tag_window_pixels: 8,
    tag_pixels: 10,
    tag_prefix: "tag36_11",
  },
};

function inchToMeter(value) {
  return 0.0254 * value;
}

function placeCenter(smallImage, largeImage) {
  const offsetX = (largeImage.width - smallImage.width) / 2;
  const offsetY = (largeImage.height - smallImage.height) / 2;

  // Create a canvas for drawing
  const canvas = document.document.createElement("canvas");
  canvas.width = largeImage.width;
  canvas.height = largeImage.height;
  const ctx = canvas.getContext("2d");

  // Draw largeImage first
  ctx.drawImage(largeImage, 0, 0);

  // Draw smallImage centered on largeImage
  ctx.drawImage(smallImage, offsetX, offsetY);

  return canvas.toDataURL(); // Returns base64 encoded image
}

// Assuming you have an SVG file URL or content
const svgUrl =
  process.env.PUBLIC_URL + "/public/apriltag_svgs/tag36h11/tag36_11_00003.svg";

console.log(svgUrl);

// Function to load SVG content
async function loadSVG(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.status}`);
  }
  return await response.text();
}

// Function to convert SVG to PNG
async function convertSVGtoPNG(svgContent) {
  console.log(svgContent);
  // Create a new Image element
  const img = new Image();
  img.src = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Create a canvas element
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw SVG image onto the canvas
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Convert canvas to PNG data URL
  const pngDataURL = canvas.toDataURL("image/png");

  return pngDataURL;
}

export function generateTagsasd() {
  loadSVG(svgUrl)
    .then((svgContent) => convertSVGtoPNG(svgContent))
    .then((pngDataURL) => {
      // Use pngDataURL as needed (e.g., display, download, etc.)
      console.log("Converted PNG data URL:", pngDataURL);
    })
    .catch((error) => {
      console.error("Error converting SVG to PNG:", error);
    });
}

export async function generateTags() {
  console.log("asdasd");
  const tagFamily = "tag36h11";
  const tagIds = Array.from({ length: 16 }, (_, i) => i);
  const tagWindowSize = 0.04;
  const tagMargin = 0.0;
  const tagPadding = 0.002;
  const dpi = 200;
  const maxCol = 4;
  const maxRow = 4;

  // Calculate paper and canvas dimensions
  const paperWidthInch = 8.5;
  const paperHeightInch = 11;
  const paperMargin = 0.5;
  const paperWidth = inchToMeter(paperWidthInch - 2 * paperMargin);
  const paperHeight = inchToMeter(paperHeightInch - 2 * paperMargin);
  const canvasWidth = paperWidthInch * dpi;
  const canvasHeight = paperHeightInch * dpi;

  // Scale for converting between meters and pixels
  const scale = canvasWidth / paperWidth;

  // Get tag configuration
  const tagWindowPixels = TAG_CONFIG[tagFamily].tag_window_pixels;
  const tagPixels = TAG_CONFIG[tagFamily].tag_pixels;
  const tagPrefix = TAG_CONFIG[tagFamily].tag_prefix;

  // Ensure tag full size fits on paper
  let tagSize = tagWindowSize;
  if (["tag16h5", "tag25h9", "tag36h11"].includes(tagFamily)) {
    tagSize = (tagWindowSize / tagWindowPixels) * tagPixels;
  }
  const tagFullSize = tagSize + 2 * tagMargin + 2 * tagPadding;
  if (tagFullSize >= paperWidth || tagFullSize >= paperHeight) {
    throw new Error("Tag size exceeds paper dimensions.");
  }

  // Array to hold generated pages
  const pages = [];
  console.log("asdasd1");
  // Loop through tagIds to generate images
  for (
    let pageIndex = 0;
    pageIndex < Math.ceil(tagIds.length / (maxRow * maxCol));
    pageIndex++
  ) {
    // Create a canvas for each page
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvasWidth;
    pageCanvas.height = canvasHeight;
    const pageCtx = pageCanvas.getContext("2d");

    // Initialize variables for tag placement
    let currentRow = 0;
    let currentCol = 0;
    console.log("asdasd2");

    // Loop through each tag to place on the page
    for (
      let tagIdx = pageIndex * maxRow * maxCol;
      tagIdx < Math.min(tagIds.length, (pageIndex + 1) * maxRow * maxCol);
      tagIdx++
    ) {
      const tagId = tagIds[tagIdx];

      // Load tag image using Image object
      const tagPath = `./apriltag_svgs/${tagFamily}/${tagPrefix}_${String(
        tagId
      ).padStart(5, "0")}.svg`;
      const tagImg = new Image();
      tagImg.src = tagPath;
      await new Promise((resolve) => {
        tagImg.onload = resolve;
      });

      // Calculate tag canvas size

      let tagCanvasSize;
      if (["tag16h5", "tag25h9", "tag36h11"].includes(tagFamily)) {
        tagCanvasSize = Math.round(tagWindowSize * scale);
      } else {
        tagCanvasSize = Math.round(tagSize * scale);
      }

      // Create a canvas for tag
      const tagCanvas = document.createElement("canvas");
      tagCanvas.width = tagCanvas.height = tagCanvasSize;
      const tagCtx = tagCanvas.getContext("2d");

      // Draw tag image on tagCanvas
      tagCtx.drawImage(tagImg, 0, 0, tagCanvasSize, tagCanvasSize);
      console.log(tagCanvas.toDataURL("image/png"));

      // Example: Add text to tagCanvas
      tagCtx.font = `${Math.round(20 * scale)}px Arial`;
      tagCtx.fillStyle = "black";
      tagCtx.fillText(`Tag ID: ${tagId}`, 10 * scale, 30 * scale);

      // Example: Add border to tagCanvas
      tagCtx.strokeStyle = "black";
      tagCtx.lineWidth = 2 * scale;
      tagCtx.strokeRect(0, 0, tagCanvasSize, tagCanvasSize);

      // Calculate position to place tag on pageCanvas
      const offsetX =
        currentCol * tagFullSize * scale + (paperMargin + tagMargin) * scale;
      const offsetY =
        currentRow * tagFullSize * scale + (paperMargin + tagMargin) * scale;

      // Draw tagCanvas on pageCanvas
      pageCtx.drawImage(tagCanvas, offsetX, offsetY);

      // Move to next column or row
      currentCol++;
      if (currentCol >= maxCol) {
        currentCol = 0;
        currentRow++;
      }
    }

    // Push the generated pageCanvas into pages array
    pages.push(pageCanvas);

    // Save or display pageCanvas as needed
    // For saving:
    // const pageImageBlob = await new Promise(resolve => pageCanvas.toBlob(resolve, 'image/png'));
    // saveToServer(pageImageBlob);

    // For displaying in UI (if using React or similar):
    // setGeneratedPage(pageCanvas.toDataURL());

    // Create download link for each page
    const downloadLink = document.createElement("a");
    downloadLink.href = pageCanvas.toDataURL("image/png");
    downloadLink.download = `page_${pageIndex}.png`;
    downloadLink.textContent = `Download Page ${pageIndex + 1}`;
    document.body.appendChild(downloadLink);
    console.log(downloadLink);
  }
}

// Call the function to generate tags
// generateTags();
