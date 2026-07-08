module.exports = {
  setupFiles: ["./test/adapterSetup.ts", "./test/mocksSetup.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "client/tsconfig.jest.json",
        diagnostics: false
      }
    ],
    "^.+\\.md?$": "<rootDir>/test/markdownTransform.cjs"
  },
  testEnvironment: "jsdom",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^dnd-core$": "dnd-core/dist/cjs",
    "^react-dnd$": "react-dnd/dist/cjs",
    "^react-dnd-html5-backend$": "react-dnd-html5-backend/dist/cjs",
    "^react-dnd-touch-backend$": "react-dnd-touch-backend/dist/cjs",
    "^react-dnd-test-backend$": "react-dnd-test-backend/dist/cjs",
    "^react-dnd-test-utils$": "react-dnd-test-utils/dist/cjs",
    "^react-markdown/lib/react-markdown$": "<rootDir>/test/reactMarkdownMock.tsx"
  }
};
