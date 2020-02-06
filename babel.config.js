module.exports = {
  // presets: ["react-app"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          components: "./src/components",
          types: "./src/types"
        }
      }
    ],
    "@babel/plugin-proposal-optional-chaining"
  ]
};
