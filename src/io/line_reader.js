morpheus.LineReader = function (lines) {
  this.lines = lines;
  this.index = 0;
};

morpheus.LineReader.prototype = {
  reset: function () {
    this.index = 0;
  },
  readLine: function () {
    var index = this.index;
    if (index >= this.lines.length) {
      return null;
    }
    this.index++;
    return this.lines[index];
  }
};
