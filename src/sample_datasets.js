morpheus.SampleDatasets = function (options) {
  if (!options.openText) {
    options.openText = 'Open';
  }
  var _this = this;
  var $el = options.$el;
  this.callback = options.callback;
  $el.on('click', '[name=ccle]', function (e) {
    var $this = $(this);
    var obj = {};
    $this.parents('tr').find('input:checked').each(function (i, c) {
      obj[$(c).data('type')] = true;
    });

    _this.openCCLE(obj);
    e.preventDefault();
  });

  $el.on('click', '[name=tcgaLink]', function (e) {
    e.preventDefault();
    var $this = $(this);
    var type = $this.data('disease-type');
    var obj = {};
    $this.parents('tr').find('input:checked').each(function (i, c) {
      obj[$(c).data('type')] = true;
    });
    var disease;
    for (var i = 0; i < _this.diseases.length; i++) {
      if (_this.diseases[i].type === type) {
        disease = _this.diseases[i];
        break;
      }
    }
    obj.type = type;
    obj.name = disease.name;
    _this.openTcga(obj);
  });
  $el
  .on(
    'click',
    '[data-toggle=dataTypeToggle]',
    function (e) {
      var $this = $(this);
      var $button = $this.parents('tr').find('button');
      var isDisabled = $this.parents('tr').find(
          'input:checked').length === 0;
      $button.prop('disabled', isDisabled);
      if (!isDisabled) {
        $button
        .removeClass('animated flash')
        .addClass('animated flash')
        .one(
          'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function () {
            $(this).removeClass(
              'animated flash');
          });
      }
    });
  $
  .ajax(
    'https://s3.amazonaws.com/data.clue.io/morpheus/tcga/tcga_index.txt')
  .done(
    function (text) {
      var exampleHtml = [];
      exampleHtml.push('<table class="table table-condensed table-bordered">');
      exampleHtml.push('<thead><tr><th>Name</th><th>Gene' +
        ' Expression</th><th>Copy Number By Gene</th><th>Mutations</th><th>Gene' +
        ' Essentiality</th><th></th></tr></thead>');
      exampleHtml.push('<tbody>');
      exampleHtml.push('<tr>');
      exampleHtml
      .push('<td>Cancer Cell Line Encyclopedia (CCLE), Project Achilles</td>');
      exampleHtml
      .push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="mrna"> </td>');

      exampleHtml
      .push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="cn"> </td>');

      exampleHtml
      .push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="sig_genes"> </td>');

      exampleHtml
      .push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="ach"> </td>');

      exampleHtml
      .push('<td><button disabled type="button" class="btn btn-link" name="ccle">'
        + options.openText + '</button></td>');
      exampleHtml.push('</tr></tbody></table>');

      exampleHtml
      .push('<div class="text-muted">TCGA data version 1/11/2015</div><span class="text-muted">Please adhere to <a target="_blank" href="http://cancergenome.nih.gov/abouttcga/policies/publicationguidelines"> the TCGA publication guidelines</a></u> when using TCGA data in your publications.</span>');

      exampleHtml.push('<div data-name="tcga"></div>');
      $(exampleHtml.join('')).appendTo($el);
      if (options.show) {
        $el.show();
      }
      var lines = text.split('\n');
      var diseases = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') {
          continue;
        }
        var tokens = line.split('\t');
        var type = tokens[0];
        var dataTypes = tokens[1].split(',');
        var name = morpheus.TcgaUtil.DISEASE_STUDIES[type];
        var disease = {
          mrna: dataTypes
          .indexOf('mRNAseq_RSEM_normalized_log2.txt') !== -1,
          sig_genes: dataTypes.indexOf('sig_genes.txt') !== -1,
          gistic: dataTypes
          .indexOf('all_lesions.conf_99.txt') !== -1,
          sample_info: dataTypes.indexOf('All_CDEs.txt') !== -1,
          mutation: dataTypes
          .indexOf('mutations_merged.maf.txt') !== -1,
          rppa: dataTypes.indexOf('rppa.txt') !== -1,
          methylation: dataTypes
          .indexOf('meth.by_mean.data.txt') !== -1,
          name: name,
          type: type,
          dataTypes: dataTypes
        };
        if (disease.mrna || disease.gistic
          || disease.sig_genes || disease.rppa
          || disease.methylation) {
          diseases.push(disease);
        }
      }
      diseases.sort(function (a, b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        return (a === b ? 0 : (a < b ? -1 : 1));

      });
      var tcga = [];
      _this.diseases = diseases;

      tcga.push('<table class="table table-condensed table-bordered">');
      tcga.push('<thead><tr>');
      tcga.push('<th>Disease</th>');
      tcga.push('<th>Gene Expression</th>');
      tcga.push('<th>GISTIC Copy Number</th>');
      tcga.push('<th>Copy Number By Gene</th>');
      tcga.push('<th>Mutations</th>');
      tcga.push('<th>Proteomics</th>');
      tcga.push('<th>Methylation</th>');
      tcga.push('<th></th>');
      tcga.push('</tr></thead>');
      tcga.push('<tbody>');
      for (var i = 0; i < diseases.length; i++) {
        var disease = diseases[i];
        tcga.push('<tr>');

        tcga.push('<td>' + disease.name + '</td>');
        tcga.push('<td>');
        if (disease.mrna) {
          tcga
          .push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="mrna"> ');
        }
        tcga.push('</td>');

        tcga.push('<td>');
        if (disease.gistic) {
          tcga
          .push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="gistic"> ');
        }
        tcga.push('</td>');

        tcga.push('<td>');
        if (disease.gistic) {
          tcga
          .push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="gisticGene"> ');
        }
        tcga.push('</td>');

        tcga.push('<td>');
        if (disease.sig_genes) {
          tcga
          .push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="sig_genes"> ');
        }
        tcga.push('</td>');

        tcga.push('<td>');
        if (disease.rppa) {
          tcga
          .push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="rppa"> ');
        }
        tcga.push('</td>');
        tcga.push('<td>');
        if (disease.methylation) {
          tcga
          .push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="methylation"> ');
        }
        tcga.push('</td>');

        tcga
        .push('<td><button disabled type="button" class="btn btn-link" name="tcgaLink" data-disease-type="'
          + disease.type
          + '">'
          + options.openText
          + '</button></td>');

        tcga.push('</tr>');
      }
      tcga.push('</tbody>');
      tcga.push('</table>');
      $(tcga.join('')).appendTo($el.find('[data-name=tcga]'));
    });
};

morpheus.SampleDatasets.getTcgaDataset = function (options) {
  var baseUrl = 'https://s3.amazonaws.com/data.clue.io/morpheus/tcga/'
    + options.type + '/';
  var datasetOptions = {};
  if (options.mrna) {
    datasetOptions.mrna = baseUrl + 'mRNAseq_RSEM_normalized_log2.txt';
  }

  if (options.methylation) {
    datasetOptions.methylation = baseUrl + 'meth.by_mean.data.txt';
  }
  if (options.sig_genes) {
    datasetOptions.mutation = baseUrl + 'mutations_merged.maf.txt';
    datasetOptions.sigGenes = baseUrl + 'sig_genes.txt';
  }
  // datasetOptions.seg = baseUrl + 'snp.seg.txt';
  if (options.rppa) {
    datasetOptions.rppa = baseUrl + 'rppa.txt';
  }
  if (options.gistic) {
    datasetOptions.gistic = baseUrl + 'all_lesions.conf_99.txt';
  }
  if (options.gisticGene) {
    datasetOptions.gisticGene = baseUrl + 'all_data_by_genes.txt';
  }

  datasetOptions.mrnaClust = baseUrl + 'bestclus.txt';

  datasetOptions.columnAnnotations = [{
    file: baseUrl + 'All_CDEs.txt',
    datasetField: 'participant_id',
    fileField: 'patient_id'
  }];
  return morpheus.TcgaUtil.getDataset(datasetOptions);

};
morpheus.SampleDatasets.getCCLEDataset = function (options) {
  var datasets = [];
  if (options.sig_genes) {
    datasets
    .push('https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_hybrid_capture1650_hg19_NoCommonSNPs_NoNeutralVariants_CDS_2012.05.07.maf.txt');
    // datasets
    // .push({
    // dataset :
    // '//s3.amazonaws.com/data.clue.io/morpheus/1650_HC_plus_RD_muts.maf.txt'
    // });
  }
  if (options.cn) {
    datasets
    .push('https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_copynumber_byGene_2013-12-03.gct');
  }

  if (options.mrna) {
    datasets
    .push('https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_Expression_Entrez_2012-09-29.txt');
  }
  if (options.ach) {
    datasets
    .push('https://s3.amazonaws.com/data.clue.io/morpheus/Achilles_QC_v2.4.3.rnai.Gs.gct');
  }
  var columnAnnotations = [];
  if (options.ach) {
    // there are several cell lines that are in Achilles but not CCLE
    columnAnnotations
    .push({
      file: 'https://s3.amazonaws.com/data.clue.io/morpheus/Achilles_v2.4_SampleInfo_small.txt',
      datasetField: 'id',
      fileField: 'id'
    });

  }
  columnAnnotations.push({
    file: 'https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_Sample_Info.txt',
    datasetField: 'id',
    fileField: 'id'
  });

  var returnDeferred = $.Deferred();
  var datasetDef = morpheus.DatasetUtil.readDatasetArray(datasets);

  var annotationDef = morpheus.DatasetUtil.annotate({
    annotations: columnAnnotations,
    isColumns: true
  });
  var datasetToReturn;
  datasetDef.done(function (d) {
    datasetToReturn = d;
  });
  datasetDef.fail(function (message) {
    returnDeferred.reject(message);
  });
  var annotationCallbacks;
  annotationDef.done(function (callbacks) {
    annotationCallbacks = callbacks;
  });
  annotationDef.fail(function (message) {
    returnDeferred.reject(message);
  });

  $.when.apply($, [datasetDef, annotationDef]).then(function () {

    annotationCallbacks.forEach(function (f) {
      f(datasetToReturn);
    });
    returnDeferred.resolve(datasetToReturn);
  });

  return returnDeferred;
};
morpheus.SampleDatasets.prototype = {

  openTcga: function (options) {
    this
    .callback({
      name: options.name,
      renderReady: function (heatMap) {
        var whitelist = [
          'age_at_initial_pathologic_diagnosis',
          'breast_carcinoma_estrogen_receptor_status',
          'breast_carcinoma_progesterone_receptor_status',
          'lab_proc_her2_neu_immunohistochemistry_receptor_status',
          'days_to_death', 'ethnicity', 'gender',
          'histological_type', 'pathologic_stage'];

        var columnMetadata = heatMap.getProject()
        .getFullDataset().getColumnMetadata();
        for (var i = 0; i < whitelist.length; i++) {
          if (columnMetadata.getByName(whitelist[i])) {
            heatMap.addTrack(whitelist[i], true, 'color');
          }
        }
        // view in space of mutation sample ids only
        if (options.sig_genes) {
          if (heatMap.getTrackIndex('q_value', false) === -1) {
            heatMap.addTrack('q_value', false, 'text');
          }
        }
      },
      columns: [{
        field: 'participant_id',
        display: 'text'
      }, {
        field: 'sample_type',
        display: 'color'
      }, {
        field: 'mutation_summary',
        display: 'stacked_bar'
      }, {
        field: 'mutation_summary_selection',
        display: 'stacked_bar'
      }, {
        field: 'mRNAseq_cluster',
        display: 'color, highlight'
      }],
      dataset: morpheus.SampleDatasets.getTcgaDataset(options)
    });
  },
  openCCLE: function (options) {
    this.callback({
      name: 'CCLE',
      rows: [{
        field: 'id',
        display: 'text,tooltip'
      }, {
        field: 'mutation_summary',
        display: 'stacked_bar'
      }, {
        field: 'Source',
        display: 'color'
      }],
      columns: [{
        field: 'id',
        display: 'text,tooltip'
      }, {
        field: 'mutation_summary',
        display: 'stacked_bar'
      }, {
        field: 'gender',
        display: 'color, highlight'
      }, {
        field: 'histology',
        display: 'color, highlight'
      }, {
        field: 'histology subtype',
        display: 'color, highlight'
      }, {
        field: 'primary_site',
        display: 'color, highlight'
      }],
      dataset: morpheus.SampleDatasets.getCCLEDataset(options)
    });
  }
};
