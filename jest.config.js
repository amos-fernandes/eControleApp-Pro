module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { 
      tsconfig: "tsconfig.json",
      isolatedModules: true,
    }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)",
  ],
  moduleNameMapper: {
    "^expo-file-system$": "<rootDir>/__mocks__/expo-file-system.ts",
    "^expo-sharing$": "<rootDir>/__mocks__/expo-sharing.ts",
    "^react-native$": "<rootDir>/__mocks__/react-native.ts",
    "^@/databases/database$": "<rootDir>/__mocks__/database.ts",
    "^@/services/retrieveUserSession$": "<rootDir>/__mocks__/retrieveUserSession.ts",
    "^@/services/connection$": "<rootDir>/__mocks__/connection.ts",
    "^./retrieveUserSession$": "<rootDir>/__mocks__/retrieveUserSession.ts",
    "^./connection$": "<rootDir>/__mocks__/connection.ts",
    "^../databases/database$": "<rootDir>/__mocks__/database.ts",
    "^../services/retrieveUserSession$": "<rootDir>/__mocks__/retrieveUserSession.ts",
    "^../services/connection$": "<rootDir>/__mocks__/connection.ts",
  },
  collectCoverageFrom: [
    "services/mtrService.ts",
    "services/mtr.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
