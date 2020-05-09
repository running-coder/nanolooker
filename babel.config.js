module.exports = {
  // presets: ["react-app"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
      },
    ],
    "@babel/plugin-proposal-optional-chaining",
  ],
};
