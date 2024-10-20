// only used for jest
module.exports = {
    presets: [
        ["@babel/preset-env", {targets: {node: "current"}}],
        "@babel/preset-typescript",
        "@babel/preset-react",
    ],
    plugins: ["babel-plugin-transform-vite-meta-env"],
};
