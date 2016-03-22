morpheus.MetadataUtil = function() {
};

morpheus.MetadataUtil.renameFields = function(dataset, options) {
	_.each(options.rows, function(item) {
		if (item.renameTo) {
			var v = dataset.getRowMetadata().getByName(item.field);
			if (v) {
				v.setName(item.renameTo);
			}
		}
	});
	_.each(options.columns, function(item) {
		if (item.renameTo) {
			var v = dataset.getColumnMetadata().getByName(item.field);
			if (v) {
				v.setName(item.renameTo);
			}
		}
	});
};

/**
 * @param options.model
 *            Metadata model
 * @param options.text
 *            Search text
 * @param options.isColumns
 *            Whether to search columns
 * @param options.defaultMatchMode
 *            'exact' or 'contains'
 * 
 */
morpheus.MetadataUtil.search = function(options) {
	var model = options.model;
	var text = options.text;
	var isColumns = options.isColumns;
	text = $.trim(text);
	if (text === '') {
		return null;
	}
	var tokens = morpheus.Util.getAutocompleteTokens(text);
	if (tokens.length == 0) {
		return null;
	}
	var indexField = isColumns ? 'COLUMN' : 'ROW';
	var fieldNames = morpheus.MetadataUtil.getMetadataNames(model);
	fieldNames.push(indexField);
	var predicates = morpheus.Util.createSearchPredicates({
		tokens : tokens,
		fields : fieldNames,
		defaultMatchMode : options.defaultMatchMode
	});
	var vectors = [];
	var nameToVector = new morpheus.Map();
	for (var j = 0; j < model.getMetadataCount(); j++) {
		var v = model.get(j);
		var dataType = morpheus.VectorUtil.getDataType(v);
		var wrapper = {
			vector : v,
			dataType : dataType,
			isArray : dataType.indexOf('[') === 0
		};
		nameToVector.set(v.getName(), wrapper);
		vectors.push(wrapper);

	}
	// TODO only search numeric fields for range searches
	var indices = [];
	var npredicates = predicates.length;
	var nfields = vectors.length;
	for (var i = 0, nitems = model.getItemCount(); i < nitems; i++) {
		var matches = false;
		for (var p = 0; p < npredicates && !matches; p++) {
			var predicate = predicates[p];
			var filterColumnName = predicate.getField();
			if (filterColumnName != null) {
				var value = null;
				if (filterColumnName === indexField) {
					value = i + 1;
					if (predicate.accept(value)) {
						matches = true;
						break;
					}
				} else {
					var wrapper = nameToVector.get(filterColumnName);
					if (wrapper) {
						value = wrapper.vector.getValue(i);
						if (value != null) {
							if (wrapper.isArray) {
								for (var k = 0; k < value.length; k++) {
									if (predicate.accept(value[k])) {
										matches = true;
										break;
									}
								}
							} else {
								if (predicate.accept(value)) {
									matches = true;
									break;
								}
							}

						}
					}
				}

			} else { // try all fields
				for (var j = 0; j < nfields; j++) {
					var wrapper = vectors[j];
					var value = wrapper.vector.getValue(i);
					if (value != null) {
						if (wrapper.isArray) {
							for (var k = 0; k < value.length; k++) {
								if (predicate.accept(value[k])) {
									matches = true;
									break;
								}
							}
						} else {
							if (predicate.accept(value)) {
								matches = true;
								break;
							}
						}

					}
				}
			}
		}
		if (matches) {
			indices.push(i);
		}
	}
	return indices;
};

morpheus.MetadataUtil.shallowCopy = function(model) {
	var copy = new morpheus.MetadataModel(model.getItemCount());
	for (var i = 0; i < model.getMetadataCount(); i++) {
		var v = model.get(i);
		// copy properties b/c they can be modified via ui
		var newVector = new morpheus.VectorAdapter(v);
		newVector.properties = new morpheus.Map();
		newVector.getProperties = function() {
			return this.properties;
		};

		v.getProperties().forEach(function(val, key) {
			if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
				newVector.properties.set(key, val);
			}

		});

		copy.vectors.push(newVector);
	}
	return copy;
};
morpheus.MetadataUtil.autocomplete = function(model) {
	return function(tokens, cb) {
		// check for term:searchText
		var matches = [];
		var regex = null;
		var searchModel = model;
		var token = tokens != null && tokens.length > 0 ? tokens[tokens.length - 1]
				: null;
		try {
			if (token != null && token !== '') {
				var field = null;
				var semi = token.indexOf(':');
				if (semi > 0) { // field search?
					if (token.charCodeAt(semi - 1) !== 92) { // \:
						var possibleField = $.trim(token.substring(0, semi));
						if (possibleField.length > 0
								&& possibleField[0] === '"'
								&& possibleField[token.length - 1] === '"') {
							possibleField = possibleField.substring(1,
									possibleField.length - 1);
						}
						var index = morpheus.MetadataUtil.indexOf(searchModel,
								possibleField);
						if (index !== -1) {
							token = $.trim(token.substring(semi + 1));
							searchModel = new morpheus.MetadataModelColumnView(
									model, [ index ]);
						}
					}

				}
				var set = new morpheus.Set();
				// regex used to determine if a string starts with substring `q`

				regex = new RegExp('^' + token, 'i');
				// iterate through the pool of strings and for any string that
				// contains the substring `q`, add it to the `matches` array
				var max = 10;

				var vectors = [];
				var isArray = [];
				for (var j = 0; j < searchModel.getMetadataCount(); j++) {
					var v = searchModel.get(j);
					var dataType = morpheus.VectorUtil.getDataType(v);
					if (dataType === 'string' || dataType === '[string]') { // skip
						// numeric
						// fields
						vectors.push(v);
						isArray.push(dataType === '[string]');
					}
				}

				var nfields = vectors.length;

				loop: for (var i = 0, nitems = searchModel.getItemCount(); i < nitems; i++) {
					for (var j = 0; j < nfields; j++) {
						var v = vectors[j];
						var val = v.getValue(i);
						if (val != null) {
							if (isArray[j]) {
								for (var k = 0; k < val.length; k++) {
									var id = new morpheus.Identifier([ val[k],
											v.getName() ]);
									if (!set.has(id) && regex.test(val[k])) {
										set.add(id);
										if (set.size() === max) {
											break loop;
										}
									}
								}
							} else {
								var id = new morpheus.Identifier([ val,
										v.getName() ]);
								if (!set.has(id) && regex.test(val)) {
									set.add(id);
									if (set.size() === max) {
										break loop;
									}
								}
							}
						}

					}
				}

				set.forEach(function(id) {
					var array = id.getArray();
					var field = array[1];
					var val = array[0];
					matches.push({
						value : (field.indexOf(' ') > 0 ? ('"' + field + '"')
								: field)
								+ ':'
								+ (val.indexOf(' ') > 0 ? ('"' + val + '"')
										: val),
						label : '<span style="font-weight:300;">' + field
								+ ':</span>'
								+ '<span style="font-weight:900;">' + val
								+ '</span>'
					});

				});
			}
		} catch (x) {

		}
		// field names
		if (regex == null) {
			regex = new RegExp('.*', 'i');
		}
		for (var j = 0; j < searchModel.getMetadataCount(); j++) {
			var v = searchModel.get(j);
			var dataType = morpheus.VectorUtil.getDataType(v);
			var field = v.getName();
			if (dataType === 'number' || dataType === 'string'
					|| dataType === '[string]') {
				if (regex.test(field)) {
					matches.push({
						value : (field.indexOf(' ') > 0 ? ('"' + field + '"')
								: field)
								+ ':',
						label : '<span style="font-weight:300;">' + field
								+ ':</span>'
					});
				}
			}
		}
		cb(matches);
	};
};

morpheus.MetadataUtil.getMetadataNames = function(metadataModel) {
	var names = [];
	for (var i = 0, count = metadataModel.getMetadataCount(); i < count; i++) {
		names.push(metadataModel.get(i).getName(i));
	}
	names.sort(function(a, b) {
		a = a.toLowerCase();
		b = b.toLowerCase();
		return (a < b ? -1 : (a === b ? 0 : 1));
	});
	return names;
};
morpheus.MetadataUtil.getVectors = function(metadataModel, names) {
	var vectors = [];
	names.forEach(function(name) {
		var v = metadataModel.getByName(name);
		if (!v) {
			throw name + ' not found. Available fields are '
					+ morpheus.MetadataUtil.getMetadataNames(metadataModel);
		}
		vectors.push(v);
	});
	return vectors;
};
morpheus.MetadataUtil.indexOf = function(metadataModel, name) {
	for (var i = 0, length = metadataModel.getMetadataCount(); i < length; i++) {
		if (name === metadataModel.get(i).getName()) {
			return i;
		}
	}
	return -1;
};

morpheus.MetadataUtil.DEFAULT_HIDDEN_FIELDS = new morpheus.Set();
[ 'pr_analyte_id', 'pr_gene_title', 'pr_gene_id', 'pr_analyte_num',
		'pr_bset_id', 'pr_lua_id', 'pr_pool_id', 'pr_is_bing', 'pr_is_inf',
		'pr_is_lmark', 'qc_slope', 'qc_f_logp', 'qc_iqr', 'bead_batch',
		'bead_revision', 'bead_set', 'det_mode', 'det_plate', 'det_well',
		'mfc_plate_dim', 'mfc_plate_id', 'mfc_plate_name', 'mfc_plate_quad',
		'mfc_plate_well', 'pert_dose_unit', 'pert_id_vendor', 'pert_mfc_desc',
		'pert_mfc_id', 'pert_time', 'pert_time_unit', 'pert_univ_id',
		'pert_vehicle', 'pool_id', 'rna_plate', 'rna_well', 'count_mean',
		'count_cv', 'provenance_code' ].forEach(function(name) {
			morpheus.MetadataUtil.DEFAULT_HIDDEN_FIELDS.add(name);
		});
morpheus.MetadataUtil.DEFAULT_FIELDS_TO_SHOW = {
	'cell_id' : true,
	'pert_idose' : true,
	'pert_itime' : true,
	'Id' : true,
	'Name' : true,
	'ID' : true,
	'pr_id' : true,
	'id' : true,
	'pr_gene_symbol' : true,
	'pr_is_lm' : true,
	'is_lm' : true,
	'pert_id' : true,
	'pert_iname' : true,
	'pert_desc' : true,
	'Description' : true,
	'gene_space' : true,
	'pert_type' : true
};
morpheus.MetadataUtil.copy = function(src, dest) {
	if (src.getItemCount() != dest.getItemCount()) {
		throw 'Item count not equal in source and destination. '
				+ src.getItemCount() + ' != ' + dest.getItemCount();
	}
	var itemCount = src.getItemCount();
	var metadataColumns = src.getMetadataCount();
	for (var j = 0; j < metadataColumns; j++) {
		var srcVector = src.get(j);
		var destVector = dest.getByName(srcVector.getName());
		if (destVector == null) {
			destVector = dest.add(srcVector.getName());
		}
		for (var i = 0; i < itemCount; i++) {
			destVector.setValue(i, srcVector.getValue(i));
		}
	}
};
morpheus.MetadataUtil.addVectorIfNotExists = function(metadataModel, name) {
	var v = metadataModel.getByName(name);
	if (!v) {
		v = metadataModel.add(name);
	}
	return v;
};
morpheus.MetadataUtil.getMatchingIndices = function(metadataModel, tokens) {
	var indices = {};
	for (var itemIndex = 0, nitems = metadataModel.getItemCount(); itemIndex < nitems; itemIndex++) {
		var matches = false;
		for (var metadataIndex = 0, metadataCount = metadataModel
				.getMetadataCount(); metadataIndex < metadataCount && !matches; metadataIndex++) {
			var vector = metadataModel.get(metadataModel
					.getColumnName(metadataIndex));
			var value = vector.getValue(itemIndex);
			for (var i = 0, length = tokens.length; i < length; i++) {
				if (tokens[i] == value) {
					matches = true;
					break;
				}
			}
		}
		if (matches) {
			indices[itemIndex] = 1;
		}
	}
	return indices;
};