/**
 * Class for reading cls files. <p/> <p/> The CLS files are simple files created
 * to load class information into GeneCluster. These files use spaces to
 * separate the fields.
 * </P>
 * <UL>
 * <LI>The first line of a CLS file contains numbers indicating the number of
 * samples and number of classes. The number of samples should correspond to the
 * number of samples in the associated RES or GCT data file.</LI>
 * <p/>
 * <UL>
 * <LI>Line format: (number of samples) (space) (number of classes) (space) 1</LI>
 * <LI>For example: 58 2 1</LI>
 * </UL>
 * <p/>
 * <LI>The second line in a CLS file contains names for the class numbers. The
 * line should begin with a pound sign (#) followed by a space.</LI>
 * <p/>
 * <UL>
 * <LI>Line format: # (space) (class 0 name) (space) (class 1 name)</LI>
 * <p/>
 * <LI>For example: # cured fatal/ref.</LI>
 * </UL>
 * <p/>
 * <LI>The third line contains numeric class labels for each of the samples.
 * The number of class labels should be the same as the number of samples
 * specified in the first line.</LI>
 * <UL>
 * <LI>Line format: (sample 1 class) (space) (sample 2 class) (space) ...
 * (sample N class)</LI>
 * <LI>For example: 0 0 0 ... 1
 * </UL>
 * <p/>
 * </UL>
 */
morpheus.ClsReader = function() {
};
morpheus.ClsReader.prototype = {
	/**
	 * Parses the cls file.
	 * 
	 * @param file
	 *            The file.
	 * @throw new Errors Exception If there is a problem with the data
	 */
	read : function(lines) {
		var regex = /[ ,]+/;
		// header= <num_data> <num_classes> 1
		var header = lines[0].split(regex);
		if (header.length < 3) {
			throw new Error('Header line needs three numbers');
		}
		var headerNumbers = [];
		try {
			for (var i = 0; i < 3; i++) {
				headerNumbers[i] = parseInt($.trim(header[i]));
			}
		} catch (e) {
			throw new Error('Header line element ' + i + ' is not a number');
		}
		if (headerNumbers[0] <= 0) {
			throw new Error(
					'Header line missing first number, number of data points');
		}
		if (headerNumbers[1] <= 0) {
			throw new Error(
					'Header line missing second number, number of classes');
		}
		var numClasses = headerNumbers[1];
		var numItems = headerNumbers[0];
		var classDefinitionLine = lines[1];
		classDefinitionLine = classDefinitionLine.substring(classDefinitionLine
				.indexOf('#') + 1);
		var classNames = $.trim(classDefinitionLine).split(regex);
		if (classNames.length < numClasses) {
			throw new Error('First line specifies ' + numClasses
					+ ' classes, but found ' + classNames.length + '.');
		}
		var dataLine = lines[2];
		var assignments = dataLine.split(regex);
		// convert the assignments to names
		for (var i = 0; i < assignments.length; i++) {
			var assignment = $.trim(assignments[i]);
			var index = parseInt(assignment);
			var tmp = classNames[index];
			if (tmp !== undefined) {
				assignments[i] = tmp;
			}
		}
		return assignments;
	}
};
