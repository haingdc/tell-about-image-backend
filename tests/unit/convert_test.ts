import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";

// Helper function để tạo mock file với nội dung JPEG tối thiểu hợp lệ
function createMockImageFile(name = "test.jpg", type = "image/jpeg"): File {
  // JPEG file header tối thiểu
  const content = new Uint8Array([
    0xFF, 0xD8, // SOI marker
    0xFF, 0xE0, // APP0 marker
    0x00, 0x10, // Length of APP0 segment
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x00, // Units: none
    0x00, 0x01, // X density
    0x00, 0x01, // Y density
    0x00, 0x00, // No thumbnail
    0xFF, 0xD9  // EOI marker
  ]);
  return new File([content], name, { type });
}

// Test API /convert-to-webp
Deno.test("POST /convert-to-webp - should return 400 when no image is provided", async () => {
  const formData = new FormData();
  const req = new Request("http://localhost:8000/convert-to-webp", {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.message, "Không tìm thấy hình ảnh trong request");
});

Deno.test("POST /convert-to-webp - should handle invalid image gracefully", async () => {
  const formData = new FormData();
  const invalidFile = new File([], "invalid.jpg", { type: "image/jpeg" });
  formData.append("image", invalidFile);

  const req = new Request("http://localhost:8000/convert-to-webp", {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 500);
  assertEquals(data.message, "Có lỗi xảy ra khi chuyển đổi hình ảnh");
});

// Test API /convert-to-webp-file
Deno.test("POST /convert-to-webp-file - should return 400 when no image is provided", async () => {
  const formData = new FormData();
  const req = new Request("http://localhost:8000/convert-to-webp-file", {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.message, "Không tìm thấy hình ảnh trong request");
});

Deno.test("POST /convert-to-webp-file - should handle invalid image gracefully", async () => {
  const formData = new FormData();
  const invalidFile = new File([], "invalid.jpg", { type: "image/jpeg" });
  formData.append("image", invalidFile);

  const req = new Request("http://localhost:8000/convert-to-webp-file", {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 500);
  assertEquals(data.message, "Có lỗi xảy ra khi chuyển đổi hình ảnh");
});
