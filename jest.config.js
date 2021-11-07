module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "client/tsconfig.json"
    }
  },
  setupFiles: ["./client/test/adapterSetup.ts", "./client/test/mocksSetup.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.md?$": "markdown-loader-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^dnd-core$": "dnd-core/dist/cjs",
    "^react-dnd$": "react-dnd/dist/cjs",
    "^react-dnd-html5-backend$": "react-dnd-html5-backend/dist/cjs",
    "^react-dnd-touch-backend$": "react-dnd-touch-backend/dist/cjs",
    "^react-dnd-test-backend$": "react-dnd-test-backend/dist/cjs",
    "^react-dnd-test-utils$": "react-dnd-test-utils/dist/cjs"
  }
};
