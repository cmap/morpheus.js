module.exports = {
  "env": {
    "browser": true,
    "jquery": true,
    "es6": true,
    "worker": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-redeclare": 0,
    "no-console": 0,
    "no-unused-vars": 0
  },
  "globals": {
    "Papa": true,
    "global": true,
    "streamSaver": true,
    "tsnejs": true,
    "JSApplet": true,
    "Dropbox": true,
    "module": true,
    "define": true,
    "ga": true,
    "morpheus": true,
    "_": true,
    "d3": true,
    "Plotly": true,
    "colorbrewer": true,
    "Hammer": true,
    "XLSX": true,
    "canvg": true,
    "Clipboard": true,
    "Newick": true,
    "saveAs": true,
    "Slick": true,
    "C2S": true
  }
};
