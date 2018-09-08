const visualPropertyMap = {

    'NODE_FILL_COLOR': {'att': 'background-color', 'type': 'color'},
    'NODE_TRANSPARENCY': {'att': 'background-opacity', 'type': 'opacity'},
    'NODE_SHAPE': {'att': 'shape', 'type': 'nodeShape'},
    'NODE_WIDTH': {'att': 'width', 'type': 'number'},
    'NODE_HEIGHT': {'att': 'height', 'type': 'number'},
    'NODE_BORDER_PAINT': {'att': 'border-color', 'type': 'color'},
    'NODE_BORDER_TRANSPARENCY': {'att': 'border-opacity', 'type': 'opacity'},
    'NODE_BORDER_WIDTH': {'att': 'border-width', 'type': 'number'},
    'NODE_SIZE' : [{'att': 'width','type': 'number'},{'att': 'height', 'type': 'number'}],

    'NODE_LABEL_FONT_FACE': {'att': 'font-family', 'type': 'fontFamily'},

    'NODE_LABEL': {'att': 'content', 'type': 'string'},
    'NODE_LABEL_COLOR': {'att': 'color', 'type': 'color'},
    'NODE_LABEL_FONT_SIZE': {'att': 'font-size', 'type': 'number'},
    'NODE_LABEL_TRANSPARENCY': {'att': 'text-opacity', 'type': 'opacity'},
    'NODE_LABEL_POSITION': {'att': 'labelPosition', 'type': 'labelPosition'},

    'EDGE_WIDTH': {'att' : 'width', 'type': 'number'},
    'EDGE_LABEL': {'att': 'label', 'type': 'string'},
    'EDGE_LABEL_COLOR': {'att': 'color', 'type': 'color'},
    'EDGE_LABEL_FONT_SIZE': {'att': 'font-size', 'type': 'number'},
    'EDGE_LABEL_FONT_FACE': {'att': 'font-family', 'type': 'fontFamily'},
    'EDGE_LABEL_TRANSPARENCY': {'att': 'text-opacity', 'type': 'opacity'},
    'EDGE_LINE_TYPE': {'att': 'line-style', 'type': 'line'},
    'EDGE_STROKE_UNSELECTED_PAINT': {'att': 'line-color', 'type': 'color'},
    'EDGE_UNSELECTED_PAINT': {'att': 'line-color', 'type': 'color'},
    'EDGE_TRANSPARENCY': {'att': 'opacity', 'type': 'opacity'},
    'EDGE_SOURCE_ARROW_SHAPE': {'att': 'source-arrow-shape', 'type': 'arrow'},
    'EDGE_TARGET_ARROW_SHAPE': {'att': 'target-arrow-shape', 'type': 'arrow'},
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT': {'att': 'target-arrow-color', 'type': 'color'},
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT': {'att': 'source-arrow-color', 'type': 'color'}
};



var nodeDefaultStyles   = [];
var nodeDefaultMappings = [];
var nodeSpecificStyles  = [];
var edgeDefaultStyles   = [];
var edgeDefaultMappings = [];
var edgeSpecificStyles  = [];
var nodeSelectedStyles  = [];
var edgeSelectedStyles  = [];





var visualProperties;
if ( niceCX.cyVisualProperties ) {
    visualProperties = niceCX.cyVisualProperties;
} else if ( niceCX.visualProperties ) {
   visualProperties = niceCX.visualProperties;
} else {
    return DEF_VISUAL_STYLE; // Delete this
}



            _.forEach(visualProperties, function (vpAspectElement) {
                _.forEach(vpAspectElement, function (vpElement) {
                    //console.log(vpElement);
                    var elementType = vpElement.properties_of;
                    if (elementType === 'nodes:default') {

                        var cyLabelPositionCoordinates = null;
                        var nodeLabelFontFace = null;
                        var defaultNodeProperties = {};
                        var nodeSize = null;

                        _.forEach(vpElement.properties, function(value, vp){
                            console.log('default node property ' + vp + ' = ' + value);
                            var cyVisualAttribute = getCyVisualAttributeForVP(vp);
                            if (cyVisualAttribute) {
                                if (vp === 'NODE_LABEL_POSITION') {
                                    cyLabelPositionCoordinates = value;

                                } else {
                                    var cyVisualAttributeType = getCyVisualAttributeTypeForVp(vp);
                                    defaultNodeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                                }
                            } else {
                                if (vp === 'NODE_LABEL_FONT_FACE') {
                                    nodeLabelFontFace  = value;
                                } else if (vp === 'NODE_SELECTED_PAINT'){
                                    var selectedColor = getCyVisualAttributeValue(value, 'color');
                                    nodeSelectedStyles.push({'selector': 'node:selected', 'css': {'background-color': selectedColor}});

                                } else if ( vp === 'NODE_SIZE') {
                                    nodeSize = value;

                                } else if ( vp === 'NODE_LABEL_WIDTH') {
                                    defaultNodeProperties['text-wrap'] = 'wrap';
                                    defaultNodeProperties['text-max-width'] = value;

                                } else if (vp === 'NODE_CUSTOMGRAPHICS_1') {

                                    if (value && !value.startsWith('org.cytoscape.PieChart')) {
                                        return; // continue the loop
                                    }
                                    var pieChartStr = value.match(/{.*}/);

                                    if (!pieChartStr) {
                                        return; // continue the loop
                                    }
                                    var pieChartObj = JSON.parse(pieChartStr[0]);

                                    /** @namespace pieChartObj.cy_colors **/
                                    if (pieChartObj && pieChartObj.cy_colors && Array.isArray(pieChartObj.cy_colors)) {
                                        var i = 1;

                                        _.forEach (pieChartObj.cy_colors, function(color) {
                                            var pieSliceColor = 'pie-' + i + '-background-color';

                                            defaultNodeProperties[pieSliceColor] = color;
                                            i++;
                                        });
                                    }

                                    /** @namespace pieChartObj.cy_dataColumns **/
                                    if (pieChartObj && pieChartObj.cy_dataColumns && Array.isArray(pieChartObj.cy_dataColumns)) {

                                        var j = 1;

                                        var normalizedNames = attributeNameMap;
                                        var pieColumns      = {};

                                        for (var l=0; l<pieChartObj.cy_dataColumns.length; l++) {
                                            pieColumns[pieChartObj.cy_dataColumns[l]] = l;
                                        }

                                        _.forEach (pieChartObj.cy_dataColumns, function(column) {

                                            var pieSliceSize  = 'pie-' + j + '-background-size';

                                            defaultNodeProperties[pieSliceSize]  =  function(ele) {
                                                var data     = ele.json().data;
                                                var totalSum = 0;

                                                var currentColumnValue = data[normalizedNames[column]];
                                                if ((typeof currentColumnValue === 'undefined') ||
                                                    (currentColumnValue === null) || (currentColumnValue <= 0)) {
                                                    return 0;
                                                }

                                                for (var key in pieColumns) {
                                                    var columnValue =  data[normalizedNames[key]];
                                                    if (columnValue > 0) {
                                                        totalSum = totalSum + columnValue;
                                                    }
                                                }

                                                return (totalSum > 0) ? (100.0 * currentColumnValue/totalSum) : 0;
                                            };

                                            j++;
                                        });
                                    }

                                    defaultNodeProperties['pie-size'] = '80%';
                                }

                            }
                        });

                        /** @namespace vpElement.dependencies.nodeSizeLocked **/
                        if ( nodeSize && vpElement.dependencies.nodeSizeLocked && vpElement.dependencies.nodeSizeLocked === 'true') {
                            defaultNodeProperties.height = nodeSize;
                            defaultNodeProperties.width = nodeSize;
                        }

                        var nodeLabelPosition = getNodeLabelPosition(cyLabelPositionCoordinates);

                        defaultNodeProperties['text-valign'] = nodeLabelPosition['text-valign'];
                        defaultNodeProperties['text-halign'] = nodeLabelPosition['text-halign'];

                        if (nodeLabelFontFace){
                            var font = nodeLabelFontFace.split(',');
                            defaultNodeProperties['font-family'] = font[0];
                            defaultNodeProperties['font-weight'] = font[1];
                        } else {
                            defaultNodeProperties['font-family'] = 'sans-serif';
                            defaultNodeProperties['font-weight'] = 'normal';
                        }
                        var defaultNodeStyle = {'selector': 'node', 'css': defaultNodeProperties};
                        nodeDefaultStyles.push(defaultNodeStyle);

                        _.forEach(vpElement.mappings, function (mapping, vp) {
                            //console.log(mapping);
                            //console.log('VP = ' + vp);
                            // need to check if the nodeSizedLocked is true for NODE_HEIGHT, NODE_WIDTH, and NODE_SIZE
                            if ( !((vp ==='NODE_HEIGHT' || vp ==='NODE_HEIGHT') &&
                                vpElement.dependencies.nodeSizeLocked && vpElement.dependencies.nodeSizeLocked === 'true') &&
                                !(vp ==='NODE_SIZE' &&( !vpElement.dependencies.nodeSizeLocked || (vpElement.dependencies.nodeSizeLocked && vpElement.dependencies.nodeSizeLocked === 'false')))
                            ) {

                                elementType = 'node';
                                var styles = mappingStyle(elementType, vp, mapping.type, mapping.definition, attributeNameMap);
                                nodeDefaultMappings = nodeDefaultMappings.concat(styles);
                            }
                        });

                    } else if (elementType === 'edges:default') {

                        var defaultEdgeProperties = {};
                        var selectedEdgeProperties = {};
                        _.forEach(vpElement.properties, function(value, vp){
                            var cyVisualAttribute = null;
                            var cyVisualAttributeType = null;
                            //console.log('default node property ' + vp + ' = ' + value);
                            //special cases for locked edge color
                            /** @namespace vpElement.dependencies.arrowColorMatchesEdge **/
                            if (vpElement.dependencies.arrowColorMatchesEdge.toLowerCase() === 'true') {
                                if(vp !== 'EDGE_STROKE_UNSELECTED_PAINT' && vp !== 'EDGE_SOURCE_ARROW_UNSELECTED_PAINT' &&
                                    vp !== 'EDGE_TARGET_ARROW_UNSELECTED_PAINT' ) {
                                    if ( vp === 'EDGE_UNSELECTED_PAINT') {   // add extra handling since the color is locked
                                        cyVisualAttribute = getCyVisualAttributeForVP('EDGE_SOURCE_ARROW_UNSELECTED_PAINT');
                                        cyVisualAttributeType = getCyVisualAttributeTypeForVp('EDGE_SOURCE_ARROW_UNSELECTED_PAINT');
                                        defaultEdgeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                                        cyVisualAttribute = getCyVisualAttributeForVP('EDGE_TARGET_ARROW_UNSELECTED_PAINT');
                                        cyVisualAttributeType = getCyVisualAttributeTypeForVp('EDGE_TARGET_ARROW_UNSELECTED_PAINT');
                                        defaultEdgeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                                    }
                                    cyVisualAttribute = getCyVisualAttributeForVP(vp);
                                    if (cyVisualAttribute) {
                                        cyVisualAttributeType = getCyVisualAttributeTypeForVp(vp);
                                        defaultEdgeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                                    } else if (vp === 'EDGE_STROKE_SELECTED_PAINT'){
                                        selectedEdgeProperties['line-color'] = getCyVisualAttributeValue(value, 'color');
                                    } else if (vp === 'EDGE_SOURCE_ARROW_SELECTED_PAINT'){
                                        selectedEdgeProperties['source-arrow-color'] = getCyVisualAttributeValue(value, 'color');
                                    } else if (vp === 'EDGE_TARGET_ARROW_SELECTED_PAINT'){
                                        selectedEdgeProperties['target-arrow-color'] = getCyVisualAttributeValue(value, 'color');
                                    }

                                }
                            } else {
                                if ( vp !== 'EDGE_UNSELECTED_PAINT') {
                                    cyVisualAttribute = getCyVisualAttributeForVP(vp);
                                    if (cyVisualAttribute) {
                                        cyVisualAttributeType = getCyVisualAttributeTypeForVp(vp);
                                        defaultEdgeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                                    } else if (vp === 'EDGE_STROKE_SELECTED_PAINT') {
                                        selectedEdgeProperties['line-color'] = getCyVisualAttributeValue(value, 'color');
                                    } else if (vp === 'EDGE_SOURCE_ARROW_SELECTED_PAINT') {
                                        selectedEdgeProperties['source-arrow-color'] = getCyVisualAttributeValue(value, 'color');
                                    } else if (vp === 'EDGE_TARGET_ARROW_SELECTED_PAINT') {
                                        selectedEdgeProperties['target-arrow-color'] = getCyVisualAttributeValue(value, 'color');
                                    }
                                }
                            }


                        });
                        if (_.keys(selectedEdgeProperties).length > 0){
                            edgeSelectedStyles.push({'selector': 'edge:selected', 'css': selectedEdgeProperties});
                        }
                        var defaultEdgeStyle = {'selector': 'edge', 'css': defaultEdgeProperties};
                        edgeDefaultStyles.push(defaultEdgeStyle);

                        _.forEach(vpElement.mappings, function (mapping, vp) {
                            //console.log(mapping);
                            //console.log('VP = ' + vp);
                            elementType = 'edge';
                            var styles = null;

                            if (vpElement.dependencies.arrowColorMatchesEdge ==='true' ) {
                                if (vp !== 'EDGE_STROKE_UNSELECTED_PAINT' && vp !== 'EDGE_SOURCE_ARROW_UNSELECTED_PAINT' &&
                                    vp !== 'EDGE_TARGET_ARROW_UNSELECTED_PAINT' )
                                {
                                    if (vp === 'EDGE_UNSELECTED_PAINT') {
                                        styles = mappingStyle(elementType, 'EDGE_TARGET_ARROW_UNSELECTED_PAINT' , mapping.type, mapping.definition, attributeNameMap);
                                        edgeDefaultMappings = edgeDefaultMappings.concat(styles);
                                        styles = mappingStyle(elementType, 'EDGE_SOURCE_ARROW_UNSELECTED_PAINT' , mapping.type, mapping.definition, attributeNameMap);
                                        edgeDefaultMappings = edgeDefaultMappings.concat(styles);
                                    }
                                    styles = mappingStyle(elementType, vp, mapping.type, mapping.definition, attributeNameMap);
                                    edgeDefaultMappings = edgeDefaultMappings.concat(styles);
                                }
                            } else {

                                styles = mappingStyle(elementType, vp, mapping.type, mapping.definition, attributeNameMap);
                                edgeDefaultMappings = edgeDefaultMappings.concat(styles);
                            }
                        });

                     /*   _.forEach(vpElement.dependencies, function(value, vp) {
                            if ( vp === 'arrowColorMatchesEdge') {
                                defaultEdgeProperties['source-arrow-color'] = defaultEdgeProperties['line-color'];
                                defaultEdgeProperties['target-arrow-color'] = defaultEdgeProperties['line-color'];
                             }
                        }); */

                    } else if (elementType === 'nodes'){
                        // 'bypass' setting node specific properties
                        /** @namespace vpElement.applies_to **/
                        var nodeId = vpElement.applies_to;
                        var nodeProperties = {};
                        _.forEach(vpElement.properties, function(value, vp){
                            var cyVisualAttribute = getCyVisualAttributeForVP(vp);
                            if (cyVisualAttribute) {
                                var cyVisualAttributeType = getCyVisualAttributeTypeForVp(vp);
                                nodeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                            }
                        });
                        var nodeSelector = 'node[ id = \'' + nodeId + '\' ]';
                        var nodeStyle = {'selector': nodeSelector, 'css': nodeProperties};
                        nodeSpecificStyles.push(nodeStyle);
                        
                    } else if (elementType === 'edges'){
                        // 'bypass' setting edge specific properties
                        var edgeId = vpElement.applies_to;
                        var edgeProperties = {};
                        _.forEach(vpElement.properties, function(value, vp){
                            var cyVisualAttribute = getCyVisualAttributeForVP(vp);
                            if (cyVisualAttribute) {
                                var cyVisualAttributeType = getCyVisualAttributeTypeForVp(vp);
                                edgeProperties[cyVisualAttribute] = getCyVisualAttributeValue(value, cyVisualAttributeType);
                            }
                        });
                        var edgeSelector = 'edge[ id = \'e' + edgeId + '\' ]';
                        var edgeStyle = {'selector': edgeSelector, 'css': edgeProperties};
                        edgeSpecificStyles.push(edgeStyle);
                    }
                });
            });

            return nodeDefaultStyles.concat(
                nodeDefaultMappings,
                nodeSpecificStyles,
                edgeDefaultStyles,
                edgeDefaultMappings,
                edgeSpecificStyles,
                nodeSelectedStyles,
                edgeSelectedStyles);
        };





