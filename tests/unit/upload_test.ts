import { assertEquals } from "@std/assert";
import { app, createApp } from "../../main.ts";
import utils from "../library/utils.ts";
import { status } from "../../modules/upload/constant.ts";
import mockConfig from "../helpers/mockConfig/upload.ts";
import mustache from "mustache";

const url = utils.getUrl("upload");

// Helper function để tạo mock file
function createMockImageFile(name = "test.jpg", type = "image/jpeg"): File {
  const content = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG magic numbers
  return new File([content], name, { type });
}

// Test API /upload
Deno.test("invalid - no image is provided", async () => {
  const formData = new FormData();
  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.status, status.NO_IMAGE_IS_PROVIDED.code);
  assertEquals(data.message, status.NO_IMAGE_IS_PROVIDED.message);
});

Deno.test("POST /upload - should successfully handle image upload", async () => {
  const formData = new FormData();
  const mockFile = createMockImageFile();
  formData.append("image", mockFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.data.message, status.OK.message);
  assertEquals(data.data.fileName, "test.jpg");
});

// Test file size validation
Deno.test("POST /upload - should validate file size when enabled", async (t) => {
  // Mock config with file size validation enabled
  const mockedConfig = mockConfig({
    upload: {
      image: {
        fileSize: {
          enabled: { value: true },
          minSize: 1,
          maxSize: 4 * 1024,
        },
      },
    },
  });
  const app = createApp(mockedConfig);

  await t.step("valid file size", async () => {
    // Create test file with 3KB size
    const largeContent = new Uint8Array(3 * 1024);
    const largeFile = new File([largeContent], "large.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("image", largeFile);

    const req = new Request(url, {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    assertEquals(res.status, 200);
    assertEquals(data.status, status.OK.code);
  });

  await t.step("invalid file size - min", async () => {
    // Create test file with 3KB size
    const content = new Uint8Array(0);
    const largeFile = new File([content], "large.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("image", largeFile);

    const req = new Request(url, {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    assertEquals(res.status, 400);
    assertEquals(data.status, status.ERROR_MIN_SIZE.code);
    assertEquals(
      data.message,
      mustache.render("Your file should be larger than {{minSize}}", {
        minSize: mockedConfig.upload.image.fileSize.minSize,
      }),
    );
  });

  await t.step("invalid file size - max", async () => {
    // Create test file with 3KB size
    const largeContent = new Uint8Array(4 * 1024 + 1);
    const largeFile = new File([largeContent], "large.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("image", largeFile);

    const req = new Request(url, {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    assertEquals(res.status, 400);
    assertEquals(data.status, status.ERROR_MAX_SIZE.code);
    assertEquals(
      data.message,
      mustache.render("Your file should be maximum size of {{maxSize}}", {
        maxSize: mockedConfig.upload.image.fileSize.maxSize,
      }),
    );
  });
});

// Test file size validation when disabled
Deno.test("POST /upload - should skip file size validation when disabled", async (t) => {
  // Mock config with file size validation disabled
  const mockedConfig = mockConfig({
    upload: {
      image: {
        fileSize: {
          enabled: { value: false },
        },
      },
    },
  });
  const app = createApp(mockedConfig);

  await t.step("valid size", async () => {
    const formData = new FormData();
    const mockFile = createMockImageFile();
    formData.append("image", mockFile);

    const req = new Request(url, {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    assertEquals(res.status, 200);
    assertEquals(data.data.message, status.OK.message);
  });

  await t.step("valid size - 0 KB", async () => {
    const formData = new FormData();
    // Tạo một file không hợp lệ để gây ra lỗi
    const invalidFile = new File([], "invalid.jpg", { type: "image/jpeg" });
    formData.append("image", invalidFile);

    const req = new Request(url, {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    assertEquals(res.status, 200);
    assertEquals(data.status, status.OK.code);
    assertEquals(data.data.fileName, "invalid.jpg");
  });
});

// Test API /upload-base64
Deno.test("POST /upload-base64 - should return 400 when no image is provided", async () => {
  const formData = new FormData();
  const req = new Request("http://localhost:8000/upload-base64", {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.message, "Không tìm thấy hình ảnh trong request");
});

Deno.test("POST /upload-base64 - should successfully convert image to base64", async () => {
  const formData = new FormData();
  const mockFile = createMockImageFile();
  formData.append("image", mockFile);

  const req = new Request("http://localhost:8000/upload-base64", {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.message, "Đã nhận được bức hình");
  assertEquals(data.fileName, "test.jpg");
  assertEquals(typeof data.base64, "string");
  assertEquals(data.base64.startsWith("data:image/jpeg;base64,"), true);
});
