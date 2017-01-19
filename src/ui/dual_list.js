morpheus.DualList = function (leftOptions, rightOptions) {
  var html = [];
  html.push('<div class="container-fluid">');
  html.push('<div class="row">');
  html.push('<div class="col-xs-4"><label>Available Fields</label></div>');
  html.push('<div class="col-xs-2"></div>');
  html.push('<div class="col-xs-4"><label>Selected Fields</label></div>');
  html.push('</div>'); // row
  html.push('<div class="row">');
  html
  .push('<div class="col-xs-4"><select class="form-control" name="left" multiple></select></div>');
  html
  .push('<div class="col-xs-2"><div class="btn-group-vertical" role="group">'
    + '<button name="add" type="button" class="btn btn-xs btn-default">Add</button>'
    + '<button name="remove" type="button" class="btn btn-xs btn-default">Remove</button>'
    + '<button name="up" type="button" class="btn btn-xs btn-default">Move Up</button>'
    + '<button name="down" type="button" class="btn btn-xs btn-default">Move Down</button>'
    + '</div></div>');
  html
  .push('<div class="col-xs-4"><select class="form-control" name="right" multiple></select></div>');
  html.push('</div>'); // row
  html.push('</div>');
  this.$el = $(html.join(''));
  var _this = this;
  this.$el.find('[name=add]').on('click', function () {
    _this.addSelected();
  });
  this.$el.find('[name=remove]').on('click', function () {
    _this.removeSelected();
  });
  this.$el.find('[name=up]').on('click', function () {
    _this.moveUp();
  });
  this.$el.find('[name=down]').on('click', function () {
    _this.moveDown();
  });
  this.left = this.$el.find('[name=left]')[0];
  this.right = this.$el.find('[name=right]')[0];
  for (var i = 0; i < leftOptions.length; i++) {
    this.left.options[i] = leftOptions[i];
  }
  for (var i = 0; i < rightOptions.length; i++) {
    this.right.options[i] = rightOptions[i];
  }
};

morpheus.DualList.prototype = {
  addSelected: function () {
    var left = this.left;
    var right = this.right;
    for (var i = 0; i < left.options.length; i++) {
      if (left.options[i].selected) {
        var opt = left.options[i];
        right.options[right.options.length] = new Option(opt.innerHTML,
          opt.value);
        left.options[i] = null;
        i--;
      }
    }
  },
  addAll: function () {
    var left = this.left;
    var right = this.right;
    for (var i = 0; i < left.options.length; i++) {
      var opt = left.options[i];
      right.options[right.options.length] = new Option(opt.innerHTML,
        opt.value);
    }
    left.options.length = 0;
  },
  removeSelected: function () {
    var left = this.left;
    var right = this.right;
    for (var i = 0; i < right.options.length; i++) {
      if (right.options[i].selected) {
        var opt = right.options[i];
        left.options[left.options.length] = new Option(opt.innerHTML,
          opt.value);
        right.options[i] = null;
        i--;
      }
    }
  },
  getOptions: function (isLeft) {
    var sel = isLeft ? this.left : this.right;
    var options = [];
    for (var i = 0; i < sel.options.length; i++) {
      options.push(sel.options[i].value);
    }
    return options;
  },
  removeAll: function () {
    var left = this.left;
    var right = this.right;
    for (var i = 0; i < right.options.length; i++) {
      var opt = right.options[i];
      left.options[left.options.length] = new Option(opt.innerHTML,
        opt.value);
    }
    right.options.length = 0;
  },
  moveUp: function () {
    var right = this.right;
    var selectedOptions = right.selectedOptions;
    var indices = [];
    for (var i = 0; i < selectedOptions.length; i++) {
      indices.push(selectedOptions[i].index);
    }
    var index = morpheus.Util.indexSort(indices, false);
    for (var i = 0; i < selectedOptions.length; i++) {
      var sel = selectedOptions[index[i]].index;
      var optHTML = right.options[sel].innerHTML;
      var optVal = right.options[sel].value;
      var opt1HTML = right.options[sel - 1].innerHTML;
      var opt1Val = right.options[sel - 1].value;
      right.options[sel] = new Option(opt1HTML, opt1Val);
      right.options[sel - 1] = new Option(optHTML, optVal);
      right.options.selectedIndex = sel - 1;
    }

  },
  moveDown: function () {
    var right = this.right;
    var selectedOptions = right.selectedOptions;
    var indices = [];
    for (var i = 0; i < selectedOptions.length; i++) {
      indices.push(selectedOptions[i].index);
    }
    var index = morpheus.Util.indexSort(indices, false);
    for (var i = 0; i < selectedOptions.length; i++) {
      var sel = selectedOptions[index[i]].index;
      var optHTML = right.options[sel].innerHTML;
      var optVal = right.options[sel].value;
      var opt1HTML = right.options[sel + 1].innerHTML;
      var opt1Val = right.options[sel + 1].value;
      right.options[sel] = new Option(opt1HTML, opt1Val);
      right.options[sel + 1] = new Option(optHTML, optVal);
      right.options.selectedIndex = sel + 1;
    }
  }
};
