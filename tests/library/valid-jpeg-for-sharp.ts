import sharp from "npm:sharp";

async function createJpegImageFile() {
  const jpegBuffer = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .jpeg() // .jpeg() method before .toBuffer(). Without .jpeg(), sharp is creating a raw buffer, not a JPEG file
    .toBuffer();
  const file = new File([jpegBuffer], "test.jpg", { type: "image/jpeg" });
  return file;
}

async function createInvalidJpegImageFile() {
  const jpegBuffer = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    // wihout .jpeg() method before .toBuffer(). Without .jpeg(), sharp is creating a raw buffer, not a JPEG file
    .toBuffer();
  const file = new File([jpegBuffer], "test.jpg", { type: "image/jpeg" });
  return file;
}

export default {
  createJpegImageFile,
  createInvalidJpegImageFile,
};
