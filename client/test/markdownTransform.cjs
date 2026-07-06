module.exports = {
  process(sourceText) {
    return {
      code: `module.exports = { default: ${JSON.stringify(sourceText)} };`
    };
  }
};
