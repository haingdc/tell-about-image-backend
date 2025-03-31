import "@std/dotenv/load";
import { Hono } from "npm:hono";
import type { Context } from "npm:hono";
import sharp from "npm:sharp";
import { OpenAI } from "@openai/openai";
import constantDescribe from "./modules/describe/constant.ts";
import { status as statusUpload } from "./modules/upload/constant.ts";
import ValidationFile from "./modules/common/validation/file.ts";
import mustache from "mustache";
import config from "./config.json" with { type: "json" };
import utilsDescribe from "./modules/describe/utils.ts";
import MockOpenAI from "./modules/describe/mock.ts";

function createApp(
  customConfig = config,
  openAI: OpenAI = utilsDescribe.getOpenAi(),
) {
  const app = new Hono();

  // Xử lý upload hình ảnh
  app.post("/upload", async (c: Context) => {
    try {
      const body = await c.req.formData();
      const image = body.get("image");

      if (!image || !(image instanceof File)) {
        return c.json({
          status: statusUpload.NO_IMAGE_IS_PROVIDED.code,
          message: statusUpload.NO_IMAGE_IS_PROVIDED.message,
        }, 400);
      }

      const fileSizeKB = Math.round(image.size / 1);
      const result = ValidationFile.validateFileSize(customConfig, fileSizeKB);
      if (!result.ok) {
        if (result.val === "invalid_minSize") {
          return c.json({
            status: statusUpload.ERROR_MIN_SIZE.code,
            message: mustache.render(statusUpload.ERROR_MIN_SIZE.message, {
              minSize: customConfig.upload.image.fileSize.minSize,
            }),
          }, 400);
        } else {
          return c.json({
            status: statusUpload.ERROR_MAX_SIZE.code,
            message: mustache.render(statusUpload.ERROR_MAX_SIZE.message, {
              maxSize: customConfig.upload.image.fileSize.maxSize,
            }),
          }, 400);
        }
      }

      // Lấy tên file gốc và encode để tránh vấn đề với dấu cách
      const originalFileName = image.name || "unknown";
      const encodedFileName = encodeURIComponent(originalFileName);

      return c.json({
        status: statusUpload.OK.code,
        data: {
          message: statusUpload.OK.message,
          fileName: encodedFileName,
        },
      }, 200);
    } catch (error) {
      console.error("Lỗi khi xử lý upload:", error);
      return c.json({
        status: statusUpload.ERROR_IMAGE_PROCESSING,
        message: statusUpload.ERROR_IMAGE_PROCESSING.message,
      }, 500);
    }
  });

  // API trả về base64 string
  app.post("/upload-base64", async (c: Context) => {
    try {
      const body = await c.req.formData();
      const image = body.get("image");

      if (!image || !(image instanceof File)) {
        return c.json(
          { message: "Không tìm thấy hình ảnh trong request" },
          400,
        );
      }

      const arrayBuffer = await image.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      // Mã hóa thành Base64
      const base64String = btoa(binary);

      return c.json({
        message: "Đã nhận được bức hình",
        fileName: image.name || "unknown",
        base64: `data:${image.type};base64,${base64String}`,
      }, 200);
    } catch (error) {
      console.error("Lỗi khi xử lý upload:", error);
      return c.json({ message: "Có lỗi xảy ra khi xử lý upload" }, 500);
    }
  });

  // API chuyển đổi hình ảnh sang WebP
  app.post("/convert-to-webp", async (c: Context) => {
    try {
      const body = await c.req.formData();
      const image = body.get("image");

      if (!image || !(image instanceof File)) {
        return c.json(
          { message: "Không tìm thấy hình ảnh trong request" },
          400,
        );
      }

      // Đọc file thành Uint8Array
      const arrayBuffer = await image.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Chuyển đổi sang WebP với sharp
      const webpBuffer = await sharp(uint8Array)
        .webp({ quality: 80 }) // quality từ 1-100
        .toBuffer();

      // Chuyển đổi buffer sang Base64 mà không gây stack overflow
      const binaryWebp = new Uint8Array(webpBuffer);
      let binaryString = "";
      for (let i = 0; i < binaryWebp.length; i++) {
        binaryString += String.fromCharCode(binaryWebp[i]);
      }

      const base64String = btoa(binaryString);

      return c.json({
        message: "Đã chuyển đổi hình ảnh sang WebP",
        fileName: `${image.name.split(".")[0]}.webp`,
        base64: `data:image/webp;base64,${base64String}`,
      }, 200);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi hình ảnh:", error);
      return c.json({ message: "Có lỗi xảy ra khi chuyển đổi hình ảnh" }, 500);
    }
  });

  // API trả về file WebP
  app.post("/convert-to-webp-file", async (c: Context) => {
    try {
      const body = await c.req.formData();
      const image = body.get("image");

      if (!image || !(image instanceof File)) {
        return c.json(
          { message: "Không tìm thấy hình ảnh trong request" },
          400,
        );
      }

      // Đọc file thành Uint8Array
      const arrayBuffer = await image.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Chuyển đổi sang WebP với sharp
      const webpBuffer = await sharp(uint8Array)
        .webp({ quality: 50 })
        .toBuffer();

      // Tạo tên file mới
      const newFileName = `${image.name.split(".")[0]}.webp`;

      // Trả về file WebP
      c.header("Content-Type", "image/webp");
      c.header("Content-Disposition", `attachment; filename="${newFileName}"`);
      return c.body(webpBuffer);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi hình ảnh:", error);
      return c.json({ message: "Có lỗi xảy ra khi chuyển đổi hình ảnh" }, 500);
    }
  });

  app.post("/describe", async (c: Context) => {
    try {
      const body = await c.req.formData();
      const image = body.get("image");
      const type = body.get("type");

      if (!image || !(image instanceof File)) {
        return c.json({
          status: constantDescribe.status.NO_IMAGE_IS_PROVIDED.code,
          message: constantDescribe.status.NO_IMAGE_IS_PROVIDED.message,
        }, 400);
      }

      const arrayBuffer = await image.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      // Mã hóa thành Base64
      const base64Image = btoa(binary);

      if (config.describe.provider.mock.enabled.value) {
        const openAI = new MockOpenAI.MockOpenAI();
        const response = await openAI.chat.completions.create();
        return c.json({
          status: constantDescribe.status.OK.code,
          data: response.choices[0].message.content,
        }, 200);
      }

      const response = await openAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là một trợ lý hữu ích và hãy trả lời bằng tiếng Việt.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: type === "alt"
                  ? "Bạn hãy cho 1 mô ta ngắn gọn để làm alt cho bức hình, tối thiểu 4 từ và tối đa 12 từ, trong phạm vi một câu."
                  : "Có gì trong bức ảnh này?",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });

      return c.json({
        status: constantDescribe.status.OK.code,
        data: response.choices[0].message.content,
      }, 200);
    } catch (error) {
      console.error("Lỗi khi xử lý upload:", error);
      return c.json({
        status: constantDescribe.status.PROCESSING_ERROR.code,
        message: constantDescribe.status.PROCESSING_ERROR.message,
      }, 500);
    }
  });

  return app;
}

// Create default app instance
const app = createApp();

const port = 8000;
console.log(`Server đang chạy tại http://localhost:${port}`);

Deno.serve({ port }, app.fetch);

export { app, createApp, port };
