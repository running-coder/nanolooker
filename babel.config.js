module.exports = {
  // presets: ["react-app"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          components: "./src/components"
        }
      }
    ],
    "@babel/plugin-proposal-optional-chaining"
  ]
};
