import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";
import utils from "../library/utils.ts";
import constantConvert from "../../modules/convert-image/constant.ts";
import jpegUtils from "../library/valid-jpeg-for-sharp.ts";

const url = utils.getUrl("convert-to-webp");

// Test API /convert-to-webp
Deno.test("POST /convert-to-webp - should return 400 when no image is provided", async () => {
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

Deno.test("POST /convert-to-webp - should handle empty image file gracefully", async () => {
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

Deno.test("POST /convert-to-webp - should convert valid image and return base64 webp", async () => {
  const formData = new FormData();
  const file = await jpegUtils.createJpegImageFile();
  formData.append("image", file);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });
  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.fileName, "test.webp");
  // đảm bảo chuỗi base64 là hợp lệ và bắt đầu với prefix cho WebP
  const base64Prefix = "data:image/webp;base64,";
  const isValidBase64 = data.base64.startsWith(base64Prefix);
  assertEquals(isValidBase64, true);

  // so sánh base64 từ response với file jpegImageBase64.txt
  const filePath =
    new URL("jpegImageBase64.txt", import.meta.resolve("testDataDir")).pathname;
  const fileContents = await Deno.readTextFile(filePath);
  assertEquals(fileContents, data.base64);
});

Deno.test("POST /convert-to-webp - should handle invalid image gracefully", async () => {
  const formData = new FormData();
  const file = await jpegUtils.createInvalidJpegImageFile();
  formData.append("image", file);
  const req = new Request(url, {
    method: "POST",
    body: formData,
  });
  const res = await app.fetch(req);
  const data = await res.json();
  assertEquals(res.status, 500);
  assertEquals(
    data.message,
    constantConvert.status.ERROR_IMAGE_PROCESSING.message,
  );
});
