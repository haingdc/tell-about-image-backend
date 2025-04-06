const defaultConfig = {
  describe: {
    image: {
      fileSize: {
        enabled: {
          description:
            "Khi bật fileSize mode, sẽ giới hạn kích thước tập tin. Nếu nằm ngoài giới hạn sẽ báo lỗi",
          value: false,
        },
        minSize: 0,
        maxSize: 4096,
      },
    },
  },
};

function mockConfig(overrides = {}) {
  const mockedConfig = JSON.parse(JSON.stringify(defaultConfig));
  return { ...mockedConfig, ...overrides };
}

export default mockConfig;
