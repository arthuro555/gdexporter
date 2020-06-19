gdjs.PixiFiltersTools.registerFilterCreator('Sepia', {
  makePIXIFilter: function(layer, effectData) {
    var colorMatrix = new PIXI.filters.ColorMatrixFilter();
    colorMatrix.sepia();
    return colorMatrix;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName !== 'opacity') return;

    filter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {},
});
