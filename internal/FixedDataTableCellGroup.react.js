/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableCellGroup.react
 * @typechecks
 */

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var FixedDataTableHelper = require('./FixedDataTableHelper');
var ImmutableObject = require('./ImmutableObject');
var React = require('./React');
var ReactComponentWithPureRenderMixin = require('./ReactComponentWithPureRenderMixin');
var FixedDataTableCell = require('./FixedDataTableCell.react');

var cx = require('./cx');
var renderToString = FixedDataTableHelper.renderToString;
var translateDOMPositionXY = require('./translateDOMPositionXY');

var PropTypes = React.PropTypes;

var DIR_SIGN = FixedDataTableHelper.DIR_SIGN;
var EMPTY_OBJECT = new ImmutableObject({});

var FixedDataTableCellGroupImpl = React.createClass({
  displayName: 'FixedDataTableCellGroupImpl',

  mixins: [ReactComponentWithPureRenderMixin],

  propTypes: {

    /**
     * Array of <FixedDataTableColumn />.
     */
    columns: PropTypes.array.isRequired,

    /**
     * The row data to render. The data format can be a simple Map object
     * or an Array of data.
     */
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

    left: PropTypes.number,

    onColumnResize: PropTypes.func,

    rowHeight: PropTypes.number.isRequired,

    rowIndex: PropTypes.number.isRequired,

    width: PropTypes.number.isRequired,

    zIndex: PropTypes.number.isRequired
  },

  render: function render() /*object*/{
    var props = this.props;
    var columns = props.columns;
    var cells = new Array(columns.length);

    var currentPosition = 0;
    for (var i = 0, j = columns.length; i < j; i++) {
      var columnProps = columns[i].props;
      if (!columnProps.allowCellsRecycling || currentPosition - props.left <= props.width && currentPosition - props.left + columnProps.width >= 0) {
        var key = 'cell_' + i;
        cells[i] = this._renderCell(props.data, props.rowIndex, props.rowHeight, columnProps, currentPosition, key);
      }
      currentPosition += columnProps.width;
    }

    var contentWidth = this._getColumnsWidth(columns);

    var style = {
      height: props.height,
      position: 'absolute',
      width: contentWidth,
      zIndex: props.zIndex
    };
    translateDOMPositionXY(style, -1 * DIR_SIGN * props.left, 0);

    return React.createElement(
      'div',
      {
        className: cx('fixedDataTableCellGroupLayout/cellGroup'),
        style: style },
      cells
    );
  },

  _renderCell: function _renderCell(
  /*?object|array*/rowData,
  /*number*/rowIndex,
  /*number*/height,
  /*object*/columnProps,
  /*number*/left,
  /*string*/key) /*object*/{
    var cellRenderer = columnProps.cellRenderer || renderToString;
    var columnData = columnProps.columnData || EMPTY_OBJECT;
    var cellDataKey = columnProps.dataKey;
    var isFooterCell = columnProps.isFooterCell;
    var isHeaderCell = columnProps.isHeaderCell;
    var cellData;

    if (isHeaderCell || isFooterCell) {
      if (rowData == null || rowData[cellDataKey] == null) {
        cellData = columnProps.label;
      } else {
        cellData = rowData[cellDataKey];
      }
    } else {
      var cellDataGetter = columnProps.cellDataGetter;
      cellData = cellDataGetter ? cellDataGetter(cellDataKey, rowData) : rowData[cellDataKey];
    }

    var cellIsResizable = columnProps.isResizable && this.props.onColumnResize;
    var onColumnResize = cellIsResizable ? this.props.onColumnResize : null;

    var className;
    if (isHeaderCell || isFooterCell) {
      className = isHeaderCell ? columnProps.headerClassName : columnProps.footerClassName;
    } else {
      className = columnProps.cellClassName;
    }

    return React.createElement(FixedDataTableCell, {
      align: columnProps.align,
      cellData: cellData,
      cellDataKey: cellDataKey,
      cellRenderer: cellRenderer,
      className: className,
      columnData: columnData,
      height: height,
      isFooterCell: isFooterCell,
      isHeaderCell: isHeaderCell,
      key: key,
      maxWidth: columnProps.maxWidth,
      minWidth: columnProps.minWidth,
      onColumnResize: onColumnResize,
      rowData: rowData,
      rowIndex: rowIndex,
      width: columnProps.width,
      left: left
    });
  },

  _getColumnsWidth: function _getColumnsWidth(columns) {
    var width = 0;
    for (var i = 0; i < columns.length; ++i) {
      width += columns[i].props.width;
    }
    return width;
  }
});

var FixedDataTableCellGroup = React.createClass({
  displayName: 'FixedDataTableCellGroup',

  mixins: [ReactComponentWithPureRenderMixin],

  propTypes: {
    /**
     * Height of the row.
     */
    height: PropTypes.number.isRequired,

    offsetLeft: PropTypes.number,

    /**
     * Z-index on which the row will be displayed. Used e.g. for keeping
     * header and footer in front of other rows.
     */
    zIndex: PropTypes.number.isRequired
  },

  getDefaultProps: function getDefaultProps() /*object*/{
    return {
      offsetLeft: 0
    };
  },

  render: function render() /*object*/{
    var _props = this.props;
    var offsetLeft = _props.offsetLeft;

    var props = _objectWithoutProperties(_props, ['offsetLeft']);

    var style = {
      height: props.height
    };

    if (DIR_SIGN === 1) {
      style.left = offsetLeft;
    } else {
      style.right = offsetLeft;
    }

    var onColumnResize = props.onColumnResize ? this._onColumnResize : null;

    return React.createElement(
      'div',
      {
        style: style,
        className: cx('fixedDataTableCellGroupLayout/cellGroupWrapper') },
      React.createElement(FixedDataTableCellGroupImpl, _extends({}, props, {
        onColumnResize: onColumnResize
      }))
    );
  },

  _onColumnResize: function _onColumnResize(
  /*number*/left,
  /*number*/width,
  /*?number*/minWidth,
  /*?number*/maxWidth,
  /*string|number*/cellDataKey,
  /*object*/event) {
    this.props.onColumnResize && this.props.onColumnResize(this.props.offsetLeft, left - this.props.left + width, width, minWidth, maxWidth, cellDataKey, event);
  }
});

module.exports = FixedDataTableCellGroup;