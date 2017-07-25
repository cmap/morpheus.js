jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 50; // 50 seconds
describe('buffered_reader_test', function () {

  function checkValues(a, b) {
    expect(a.length).toEqual(b.length);
    if (a.length === b.length) {
      for (var i = 0; i < a.length; i++) {
        expect(a[i]).toEqual(b[i]);
      }
    }
  }

  it('test_chunk', function (done) {
    if (morpheus.Util.isFetchSupported()) {
      var url = 'test_files/CCLE_hybrid_capture1650_hg19_NoCommonSNPs_NoNeutralVariants_CDS_2012.05.07.maf.txt';
      var lines = [];
      var splitLines = null;
      var p1 = $.Deferred();
      var p2 = $.Deferred();
      var promises = [p1, p2];
      fetch(url).then(function (response) {
        if (response.ok) {
          var reader = response.body.getReader();
          new morpheus.BufferedReader(reader, function (line) {
            lines.push(line);
          }, function () {
            p1.resolve();
          });
        } else {
          done.fail('Network error');
        }
      }).catch(function (error) {
        done.fail(error);
      });
      $.ajax(url).done(function (text) {
        splitLines = text.split('\n');
        splitLines = splitLines.slice(0, splitLines.length - 1);
        p2.resolve();
      });
      $.when.apply($, promises).then(function () {
        checkValues(lines, splitLines);
        done();
      });
    } else {
      done();
    }
  });
});
