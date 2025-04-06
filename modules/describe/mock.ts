class MockOpenAI {
  constructor() {
    // Constructor không cần làm gì
  }

  chat = {
    completions: {
      create: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: "Đây là một bức ảnh đẹp",
              },
            },
          ],
        }),
    },
  };
}

class MockErrOpenAI {
  constructor() {
    // Constructor không cần làm gì
  }

  chat = {
    completions: {
      create: () => Promise.reject(new Error("OpenAI API Error")),
    },
  };
}

export default {
  MockOpenAI,
  MockErrOpenAI,
};
