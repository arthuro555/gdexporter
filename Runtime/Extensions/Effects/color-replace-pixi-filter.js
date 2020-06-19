gdjs.PixiFiltersTools.registerFilterCreator('ColorReplace', {
  makePIXIFilter: function(layer, effectData) {
    var colorReplaceFilter = new PIXI.filters.ColorReplaceFilter();

    return colorReplaceFilter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'epsilon') {
      filter.epsilon = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
    if (parameterName === 'originalColor') {
      filter.originalColor = parseInt(value.replace('#', '0x'), 16);
    }
    else if (parameterName === 'newColor') {
      filter.newColor = parseInt(value.replace('#', '0x'), 16);
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {},
});
