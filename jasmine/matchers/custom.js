var customMatchers = {
  toBeDatasetValues: function (util, customEqualityTesters) {
    return {
      compare: function (actual, expected, tol) {
        if (!tol) {
          tol = 0;
        }
        if (actual.getRowCount() != expected.getRowCount()
          || actual.getColumnCount() != expected.getColumnCount()) {
          return {
            message: 'Dimensions differ'
          };
        }
        for (var i = 0; i < actual.getRowCount(); i++) {
          for (var j = 0; j < expected.getColumnCount(); j++) {
            if (Math.abs(actual.getValue(i, j)
                - expected.getValue(i, j)) > tol) {
              return {
                message: 'Values differ at row ' + i + ', column ' + j
                + '. Actual value: ' + actual.getValue(i, j) + ', Expected value: '
                + expected.getValue(i, j)
              };
            }
          }
        }
        return {
          pass: true
        };
      }
    };
  }
};

beforeEach(function () {
  jasmine.addMatchers(customMatchers);
});
