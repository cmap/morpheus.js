morpheus.MaximumMeanProbe = function(probes) {
  return morpheus.MaximumUnivariateFunction(probes, morpheus.Mean);
};

morpheus.MaximumMeanProbe.toString = function() {
  return "Maximum Mean Probe";
};

morpheus.MaximumMeanProbe.selectOne = true;

morpheus.MaximumMedianProbe = function(probes) {
  return morpheus.MaximumUnivariateFunction(probes, morpheus.Median);
};

morpheus.MaximumMedianProbe.toString = function() {
  return "Maximum Median Probe";
};

morpheus.MaximumMedianProbe.selectOne = true;

morpheus.MaximumUnivariateFunction = function(rowView, fun) {
  var curMax = Number.NEGATIVE_INFINITY;
  var curIndex = -1;
  for (var i = 0; i < rowView.dataset.getRowCount(); i++) {
    rowView.setIndex(i);
    var mean = fun(rowView);
    if (mean > curMax) {
      curMax = mean;
      curIndex = i;
    }
  }
  return {
    value : curMax,
    index : curIndex
  }
};
