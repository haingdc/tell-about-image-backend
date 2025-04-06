const status = {
  NO_IMAGE_IS_PROVIDED: {
    code: "UPLOAD_101",
    description: "error happens when server get no image",
    message: "No image is provided",
  },
  ERROR_IMAGE_PROCESSING: {
    code: "UPLOAD_102",
    descriptin: "error happens in image processing",
    message: "There is an error when process the image",
  },
  OK: {
    code: "UPLOAD_103",
    description: "We get image, then return success",
    message: "We got the image",
  },
  ERROR_MIN_SIZE: {
    code: "UPLOAD_104",
    description:
      "in config.json, when fileSize is enable and the image is lessen than minSize",
    message: "Your file should be larger than {{minSize}}",
  },
  ERROR_MAX_SIZE: {
    code: "UPLOAD_105",
    description:
      "in config.json, when fileSize is enable and the image is over the maxSize",
    message: "Your file should be maximum size of {{maxSize}}",
  },
};

export { status };
