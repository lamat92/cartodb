var ColumnView = require('./infowindow-column-view.js');
var template = require('./infowindow-columns.tpl');
var cdb = require('cartodb.js');
var $ = require('jquery');
var Backbone = require('backbone');

require('jquery-ui/sortable');

module.exports = cdb.core.View.extend({

  initialize: function (opts) {
    if (!opts.layerInfowindowModel) throw new Error('layerInfowindowModel is required');
    if (!opts.layerTableModel) throw new Error('layerTableModel is required');

    this._layerInfowindowModel = opts.layerInfowindowModel;
    this._layerTableModel = opts.layerTableModel;

    this._columnsCollection = this._layerTableModel.columnsCollection

    // An internal collection to keep track of the columns and their order
    this._sortedFields = new Backbone.Collection;
    this._sortedFields.comparator = function(model) {
      return model.get('position');
    }
  },

  render: function () {
    this.clearSubViews();

    this.$el.html(template);

    this._destroySortable();
    this._renderFields();
    this._initSortable();
    this._storeSortedFields();

    return this;
  },

  _initSortable: function () {
    this.$('.js-columns').sortable({
      axis: 'y',
      items: '> li',
      opacity: 0.8,
      update: this._onSortableFinish.bind(this),
      forcePlaceholderSize: false
    }).disableSelection();
  },

  _destroySortable: function () {
    if (this.$('.js-columns').data('ui-sortable')) {
      this.$('.js-columns').sortable('destroy');
    }
  },

  _onSortableFinish: function () {
    var self = this;
    this._sortedFields.reset([]);

    this.$('.js-columns > .js-column').each(function (i, el) {
debugger;
//       var modelCid = jQuery(item).data('model-cid');
//       var model = self._columnsCollection.get(modelCid);
// debugger;
//       model.setColumnProperty(model.get('name'), 'position', index)

//       self._sortedFields.reset([]);

//       self._sortedFields.add({
//         name: model.get('name'),
//         position: index
//       })
    });
  },

  _getSortedColumnNames: function() {
    var self = this;
    var names = this._getColumnNames();
    if (self._layerInfowindowModel.fieldCount() > 0) {
      names.sort(function(a, b) {
        var pos_a = self._layerInfowindowModel.getFieldPos(a);
        var pos_b = self._layerInfowindowModel.getFieldPos(b);
        return pos_a - pos_b;
      });
    }
    return names;
  },

  _storeSortedFields: function() {
    var self = this;

    this._sortedFields.reset([]);

    var names = this._getSortedColumnNames();
    _(names).each(function(name, position) {
      self._sortedFields.add({
        name: name,
        position: position
      })
    });
  },

  _getColumnNames: function() {
    var self = this;

    var columns =  this._columnsCollection.models

    var filteredColumns = _(columns).filter(function(c) {
      return !_.contains(self._layerInfowindowModel.SYSTEM_COLUMNS, c.get('name'));
    })

    var columnNames = []

    _(filteredColumns).each(function(m) {
      columnNames.push(m.get('name'));
    })

    return columnNames;
  },

  _renderFields: function() {
    var self = this;

    var names = this._getColumnNames();

    // If there isn't any valid column available
    // show the message in the background
    // if (names.length == 0) {
    //   this._showNoContent();
    //   return false;
    // }

    names.sort(function(a, b) {
      var pos_a = self._layerInfowindowModel.getFieldPos(a);
      var pos_b = self._layerInfowindowModel.getFieldPos(b);
      return pos_a - pos_b;
    });

    _(names).each(function(f, i) {
      // when there are no columns selected, sort using the view list position
      var pos = self._layerInfowindowModel.fieldCount() ?  self._layerInfowindowModel.getFieldPos(f) : i;

      var view = new ColumnView({
        model: self._layerInfowindowModel,
        column: f,
        position: pos
      });
      self.addView(view);
      self.$('.js-columns').append(view.render().el);
    });
  },

  clean: function () {
    this._destroySortable();
    cdb.core.View.prototype.clean.apply(this);
  }
});