morpheus.VectorKeys = {};
/** [string] of field names in array */
morpheus.VectorKeys.FIELDS = 'morpheus.fields';
morpheus.VectorKeys.VALUE_TO_INDICES = 'morpheus.valueToIndices';
/** [int] of visible field indices in morpheus.VectorKeys.FIELDS */
morpheus.VectorKeys.VISIBLE_FIELDS = 'morpheus.visibleFields';
morpheus.VectorKeys.DATA_TYPE = 'morpheus.dataType';
/** Function to map an array to a single value for sorting */
morpheus.VectorKeys.ARRAY_SUMMARY_FUNCTION = 'morpheus.arraySummaryFunct';
/** Key for object (e.g. box plot) that summarizes data values */
morpheus.VectorKeys.HEADER_SUMMARY = 'morpheus.headerSummary';
/** Key indicating to show header summary */
morpheus.VectorKeys.SHOW_HEADER_SUMMARY = 'morpheus.showHeaderSummary';

morpheus.VectorKeys.TITLE = 'morpheus.title';
/** Function to compute vector value */
morpheus.VectorKeys.FUNCTION = 'morpheus.funct';

/** Indicates that vector values are dynamically computed based on selection */
morpheus.VectorKeys.SELECTION = 'morpheus.selection';

/** Whether to recompute a function when creating a new heat map */
morpheus.VectorKeys.RECOMPUTE_FUNCTION = 'morpheus.recompute.funct';

/** Whether to recompute a function when heat map selection changes */
morpheus.VectorKeys.RECOMPUTE_FUNCTION_SELECTION = 'morpheus.recompute.funct.selection';

morpheus.VectorKeys.COPY_IGNORE = new morpheus.Set();
morpheus.VectorKeys.COPY_IGNORE.add(morpheus.VectorKeys.HEADER_SUMMARY);
morpheus.VectorKeys.COPY_IGNORE.add(morpheus.VectorKeys.DATA_TYPE);
morpheus.VectorKeys.COPY_IGNORE.add(morpheus.VectorKeys.VALUE_TO_INDICES);

morpheus.VectorKeys.JSON_WHITELIST = new morpheus.Set();
morpheus.VectorKeys.JSON_WHITELIST.add(morpheus.VectorKeys.FIELDS);
morpheus.VectorKeys.JSON_WHITELIST.add(morpheus.VectorKeys.DATA_TYPE);
morpheus.VectorKeys.JSON_WHITELIST.add(morpheus.VectorKeys.TITLE);
