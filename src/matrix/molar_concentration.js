morpheus.MolarConcentration = function () {

};
/*
 *
 millimolar 	mM 	10-3 molar 	10-0 mol/m3
 micromolar 	uM 	10-6 molar 	10-3 mol/m3
 nanomolar 	nM 	10-9 molar 	10-6 mol/m3
 picomolar 	pM 	10-12 molar 	10-9 mol/m3
 femtomolar 	fM 	10-15 molar 	10-12 mol/m3
 attomolar 	aM 	10-18 molar 	10-15 mol/m3
 zeptomolar 	zM 	10-21 molar 	10-18 mol/m3
 yoctomolar 	yM[3] 	10-24 molar	10-27 mol/m3
 */
morpheus.MolarConcentration.getMicroMolarConcentration = function (text) {
  /** concentration in molar*/
  text = text.toLowerCase();
  for (var i = 0; i < morpheus.MolarConcentration.CONCENTRATIONS.length; i++) {
    var pair = morpheus.MolarConcentration.CONCENTRATIONS[i];
    var key = pair[0];
    var factorToMolar = pair[1];
    var index = text.indexOf(key);
    if (index != -1) {
      var value = text.substring(0, index).trim();
      var factor = factorToMolar / 10E6;
      var conc = parseFloat(value);
      return conc / factor;

    }
  }
};
morpheus.MolarConcentration.CONCENTRATIONS = [
  ['mm', 10E3],
  ['um', 10E6],
  ['\u00B5' + 'm', 10E6],
  ['nm', 10E9],
  ['pm', 10E12],
  ['fm', 10E15],
  ['am', 10E18],
  ['zm', 10E21],
  ['ym', 10E24],
  ['m', 1]];




