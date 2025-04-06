import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";
import constantConvert from "../../modules/convert-image/constant.ts";
import jpegUtils from "../library/valid-jpeg-for-sharp.ts";
import utils from "../library/utils.ts";

const url = utils.getUrl("convert-to-webp-file");

// Test API /convert-to-webp-file
Deno.test("POST /convert-to-webp-file - should return 400 when no image is provided", async () => {
  const formData = new FormData();
  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(
    data.message,
    constantConvert.status.NO_IMAGE_IS_PROVIDED.message,
  );
});

Deno.test("POST /convert-to-webp-file - should handle invalid image gracefully", async () => {
  const formData = new FormData();
  const invalidFile = new File([], "invalid.jpg", { type: "image/jpeg" });
  formData.append("image", invalidFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.message, constantConvert.status.INVALID_IMAGE.message);
});

Deno.test("POST /convert-to-webp-file - should return 400 for unsupported file type", async () => {
  const formData = new FormData();
  const unsupportedFile = new File(["dummy content"], "unsupported.txt", {
    type: "text/plain",
  });
  formData.append("image", unsupportedFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.message, constantConvert.status.INVALID_IMAGE.message);
});

Deno.test("POST /convert-to-webp-file - should return 500 for excessively large image", async () => {
  const formData = new FormData();
  const filePath =
    new URL("14413x19225.jpg", import.meta.resolve("testDataDir"))
      .pathname;
  const largeFile = await utils.createImageFile(filePath);
  formData.append("image", largeFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(
    data.message,
    constantConvert.status.EXCEEDS_PIXEL_LIMIT.message,
  );
});

Deno.test("POST /convert-to-webp-file - should successfully convert a valid image to WebP", async () => {
  const formData = new FormData();
  const validFile = await jpegUtils.createJpegImageFile();
  formData.append("image", validFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);

  // Kiểm tra status code
  assertEquals(res.status, 200);

  // Kiểm tra headers
  assertEquals(res.headers.get("Content-Type"), "image/webp");
  assertEquals(
    res.headers.get("Content-Disposition"),
    `attachment; filename="${validFile.name.split(".")[0]}.webp"`,
  );

  // Kiểm tra nội dung file WebP
  const buffer = await res.arrayBuffer();

  // Kiểm tra kích thước tối thiểu của một file WebP hợp lệ
  assertEquals(buffer.byteLength > 0, true, "WebP file should not be empty");

  // Kiểm tra WebP file signature
  const webpSignature = new Uint8Array(buffer.slice(0, 4));
  assertEquals(
    Array.from(webpSignature),
    [0x52, 0x49, 0x46, 0x46],
    "File should have valid WebP signature",
  );
});
