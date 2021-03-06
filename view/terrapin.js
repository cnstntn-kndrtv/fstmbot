//@ts-nocheck

var terrapinConfig = {
    labelInTitle: true, // TODO
    labelTag: 'rdfs#label111111',
    prefixes: [],
    tripleDelimiter: '_',
    // full, compact, force
    viewType: 'full',
    autoHidePredicatesInFullMode: true,
    autoArranging: true,

    showGrid: false,
    gridStep: 50,
    gridPointSize: 2,
    snapTogrid: false,

    width: $(document).width(),
    height: $(document).height() - 50,
    x: 0,
    y: 0,
    
    maxZoom: 5,
    minZoom: 0.3,

    zoomOnElementFocus: 1.2,

    overlapNodes: false, // TODO
    
    forceGraphNodesRadius: 100,

    terrapinWidth: 240,
    connectorRadius: 6,

    subjectPillowHeight: 30,
    subjectTextWidth: 217,
    subjectTextMaxStrings: 3,
    
    predicateTextMaxStrings: 3,
    predicateTextWidth: 115,

    objectTextMaxStrings: 3,
    objectTextWidth: 115,

    contentIndent: 5,

    terrapinNodesOffset: 200,

    arrangeFistId: 'default',

    collapsiblePredicates: ['nextRules'],
}

terrapinConfig.minTerrapinX = 0;
terrapinConfig.maxTerrapinX = terrapinConfig.width - terrapinConfig.terrapinWidth;

terrapinConfig.minTerrapinY = 5;
terrapinConfig.maxTerrapinY = terrapinConfig.height - terrapinConfig.subjectPillowHeight;

var data = {};
data.links = [],
data.nodes = [];

var uniqueSubjects = new Map(),
    uniquePredicates = new Map(),
    uniqueObjects = new Map(),
    uniqueSubjectsAndObjects = new Set();

fromDB.forEach((triple) => {
    let subject = cleanupTripleString(triple.subject);
    let predicate = cleanupTripleString(triple.predicate);
    let object = cleanupTripleString(triple.object);

    uniqueSubjects.set(subject);
    uniquePredicates.set(predicate);
    uniqueObjects.set(object);

    uniqueSubjectsAndObjects.add(subject);
    uniqueSubjectsAndObjects.add(object);
});

function cleanupTripleString(something) {
    something = something.toString();
    if (something == '') something = 'NOT SET';
    return something;
}

// nodes
uniqueSubjectsAndObjects.forEach( (subject) => {
    let triples = [],
        uniquePredicates = new Set(),
        predicates = {},
        visible = true,
        collapsiblePredicates = {};

    fromDB.forEach( (triple) => {
        triple.subject = cleanupTripleString(triple.subject);
        triple.predicate = cleanupTripleString(triple.predicate);
        triple.object = cleanupTripleString(triple.object);
        
        if (triple.subject == subject) {
            triples.push(triple);
            uniquePredicates.add(triple.predicate);
        }
        else if (triple.object == subject) {
            if (triple.hasOwnProperty('visible') && !triple.visible) visible = false;
        }
    })
    uniquePredicates.forEach( (predicate) => {
        predicates[predicate] = {};
        if (terrapinConfig.collapsiblePredicates.includes(predicate)) {
            let p = {
                collapsed: terrapinConfig.autoHidePredicatesInFullMode,
                blockId: 'collapsible-' + subject + '_' + predicate,
                collapsedHeight: 0,
                fullHeight: 0,
            }
            collapsiblePredicates[predicate] = p;
        }
        triples.forEach( (triple) => {
            if (triple.predicate == predicate) {
                predicates[predicate][triple.object] = {
                    selected: false,
                };
            }
        })
    })
    let label = (uniquePredicates.has(terrapinConfig.labelTag)) ? Object.keys(predicates[terrapinConfig.labelTag])[0] : subject;

    function collapsePredicate(predicate, collapse) {
        if (collapse == undefined) collapse = !this.collapsiblePredicates[predicate].collapsed;
        this.collapsiblePredicates[predicate].collapsed = collapse;
        
        let blockId = this.collapsiblePredicates[predicate].blockId;
        if (collapse) {
            $(`#${blockId} > .terrapin-collapsed-predicate-container`).show();
            $(`#${blockId} > .terrapin-body-pillow`).hide();
            $(`#${blockId} > .terrapin-predicate-text`).hide();
            $(`#${blockId} > .terrapin-objects-block`).hide();
        }
        else {
            $(`#${blockId} > .terrapin-collapsed-predicate-container`).hide();
            $(`#${blockId} > .terrapin-body-pillow`).show();
            $(`#${blockId} > .terrapin-predicate-text`).show();
            $(`#${blockId} > .terrapin-objects-block`).show();
        }
        tick();
    }
    let terrapin = {
        id: subject,
        label: label,
        predicates: predicates,
        numOfIncomes: 0,
        numOfOutcomes: 0,
        selected: false,
        visible: visible,
        collapsiblePredicates: collapsiblePredicates,
        collapsePredicate: collapsePredicate,

        get x2() {
            return this.x + this.width;
        },

        get y2() {
            let height;
            switch (terrapinConfig.viewType) {
                case 'compact':
                    height = this.titleHeight;
                    break;
                case 'full':
                    height = this.height;
                    break;
                case 'force':
                    height = 0;
                    break;
            }
            return this.y + height;
        },

        get height() {
            let height = this.fullHeight
            for (let p in this.collapsiblePredicates) {
                let pr = this.collapsiblePredicates[p];
                if (pr.collapsed) height = height - pr.fullHeight + pr.collapsedHeight;
            }
            return height;
        }
    }
    data.nodes.push(terrapin);
})

//links
function checkIsNodeVisible(nodeId) {
    let visible = true;
    for (let i = 0; i < data.nodes.length; i++) {
        let node = data.nodes[i];
        if (node.id == nodeId && !node.visible) visible = false;
    }
    return visible;
}
function countVisibleTargets(targets) {
    let count = 0;
    targets.forEach((target) => {
        if (checkIsNodeVisible(target)) count++;
    })
    return count;
}
data.nodes.forEach((n) => {
    for (let predicate in n['predicates']) {
        if (n['predicates'].hasOwnProperty(predicate)) {
            let objects = n['predicates'][predicate];
            // let objectsArray = Object.keys(objects);
            // n.numOfOutcomes += objectsArray.length; // TODO
            n.numOfOutcomes += countVisibleTargets(Object.keys(objects));
            // debugger;
            for (let object in objects) {
                let isVisible = checkIsNodeVisible(object);
                data.links.push({
                    fullViewSource: n.id + terrapinConfig.tripleDelimiter + predicate + terrapinConfig.tripleDelimiter + object,
                    source: n.id,
                    target: object,
                    predicate: predicate,
                    selected: false,
                    visible: isVisible,
                })
                for (let i = 0; i < data.nodes.length; i++) {
                    if (data.nodes[i].id == object) {
                        data.nodes[i].numOfIncomes += 1;
                        break;
                    }
                }
            }
        }
    }
})

uniqueSubjects = null,
uniquePredicates = null,
uniqueObjects = null,
uniqueSubjectsAndObjects = null;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var zoom = d3.zoom()
            .scaleExtent([terrapinConfig.minZoom, terrapinConfig.maxZoom])
            .translateExtent([ 
                [
                    snapTogrid(0 - terrapinConfig.width / terrapinConfig.minZoom), 
                    snapTogrid(0 - terrapinConfig.height / terrapinConfig.minZoom)
                ], [
                    terrapinConfig.width * terrapinConfig.maxZoom, 
                    terrapinConfig.height * terrapinConfig.maxZoom
                ]
            ])
            .on('zoom', zoomed)
            .on('end', zoomEnded);

var svg = d3.select('#graphView').append('svg')
    .attr('width', terrapinConfig.width)
    .attr('height', terrapinConfig.height)
    .style('top', terrapinConfig.x)
    .style('left', terrapinConfig.y)
    .call(zoom);

var canvas = svg.append('g').attr('id', 'canvas').attr('class', 'colored');

// search
var searchButton = document.querySelector('#searchButton');
var searchField = document.querySelector('#searchField');
var searchResults = [];
searchField.oninput = () => {
    let query = toLowerCase(searchField.value);
    searchResults = [];
    data.nodes.forEach((n) => {
        if (query != '' && ~toLowerCase(n.id).indexOf(query)) highlightDependencies(n.id, true);
        else highlightDependencies(n.id, false);
    })
};
// go!
var graph = {
    x: 0,
    y: 0,
    x2: 0, 
    y2: 0,
}
if (terrapinConfig.showGrid) createGrid();
createLinks(data.links);
createNodes(data.nodes);
simulate(data.nodes, data.links);
changeNodeType(terrapinConfig.viewType);
collapseAllNodePredicates();
var arrangeConfig;
createArrangeConfig();

var arrangeConfigByContext;
createArrangeConfigByContext();

if (terrapinConfig.autoArranging) arrange();

// grid
var grid;
function createGrid() {
    let x,
        minX = snapTogrid(0 - terrapinConfig.width / terrapinConfig.minZoom),
        maxX = terrapinConfig.width * terrapinConfig.maxZoom,
        y = snapTogrid(0 - terrapinConfig.height / terrapinConfig.minZoom),
        maxY = terrapinConfig.height * terrapinConfig.maxZoom;
    
    grid = canvas.append('g')
        .attr('id', 'grid')
    
    // grid border
    grid
        .append('rect')
        .attr('x', minX)
        .attr('y', y)
        .attr('width', maxX - minX)
        .attr('height', maxY - y);
    
    // begining of coords
    // TODO killme
    grid.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 3).attr('fill', 'orange').attr('id', 'imTheBegining');
    
    // grid
    while (y <= maxY) {
        grid
            .append('line')
                .attr('x1', minX)
                .attr('x2', maxX)
                .attr('y1', y)
                .attr('y2', y)
                .attr('stroke-width', terrapinConfig.gridPointSize)
                .attr('stroke-dasharray', [terrapinConfig.gridPointSize, terrapinConfig.gridStep]);
        
        y += terrapinConfig.gridStep;
    }
}
var terrapin = {};

// nodes
function createNodes(nodes) {
    let hiddenNodes = [];
    data.nodes.forEach((d) => {
        if (!d.visible) hiddenNodes.push(d.id);
    })

    let drag = d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded);

    graph.nodes = canvas.append('g')
            .attr('class', 'nodes')
        .selectAll('svg')
            .data(nodes)
            .enter().filter((d) => d.visible)
                .append('svg')
                    .attr('id', (d) => d.id)
                    .call(drag);

    // force layout graph
    graph.nodes.append((d) => {
        let forceNodes = d3.select(createElement('svg'));
        forceNodes.attr('class', 'force-nodes');
        forceNodes.append(() => {
            let node = d3.select(createElement('svg'));
            let nodePillow = d3.select(createElement('circle'));
            let nodeText = d3.select(createElement('text'));
    
            nodeText
                .attr('class', 'terrapin-title-text')
                .text(d.label)
                    .call(wrapText, terrapinConfig.subjectTextWidth, terrapinConfig.subjectTextMaxStrings);
    
            nodePillow
                .attr('r', terrapinConfig.forceGraphNodesRadius)
                .attr('fill', () => color(d.id));
            node
                .attr('class', 'force-node');
            
            node.append(() => nodePillow.node());
            node.append(() => nodeText.node());
            return node.node();
        })
        return forceNodes.node();
    })


    // terrapin view
    graph.nodes.append((d) => {
        let terrapinNodes = d3.select(createElement('svg'));
        terrapinNodes.attr('class', 'terrapin-nodes');

        // node title
        terrapinNodes.append(() => {
            let title = d3.select(createElement('svg'));
            let titlePillow = d3.select(createElement('rect'));
            let titleText = d3.select(createElement('text'));
            titleText
                .attr('class', 'terrapin-title-text')
                .attr('y', terrapinConfig.contentIndent)
                .attr('x', terrapinConfig.connectorRadius * 2 + terrapinConfig.contentIndent)
                .text(d.label)
                    .call(wrapText, terrapinConfig.subjectTextWidth, terrapinConfig.subjectTextMaxStrings);

            let titleTextHeight = getSizeNotRendered(titleText).height;
            let titlePillowHeight = titleTextHeight + terrapinConfig.contentIndent * 2;

            titlePillow
                .attr('class', 'terrapin-title-pillow')
                .attr('x', terrapinConfig.connectorRadius + 1)
                .attr('width', terrapinConfig.terrapinWidth - 2 + 'px')
                .attr('height', titlePillowHeight + 'px')
                .attr('rx', 5)
                .attr('fill', () => color(d.id));
            
            if (Object.keys(d.predicates).length) d.bodyY = titleTextHeight + terrapinConfig.contentIndent;
            else d.bodyY = titleTextHeight + terrapinConfig.contentIndent * 2;
            
            title.attr('class', 'terrapin-title');
            title.append(() => titlePillow.node());
            title.append(() => titleText.node());
            title.on('dblclick', () => clickForHighlight(d, d.id, 'title'));
            d.titleElement = title.node();
            d.titleHeight = titlePillowHeight;
            return title.node();
        })
        // node title connector In
        terrapinNodes.append('circle')
            .attr('class', 'terrapin-connection-point-in')
            .attr('r', terrapinConfig.connectorRadius)
            .attr('cx', terrapinConfig.connectorRadius)
            .attr('cy', terrapinConfig.subjectPillowHeight / 2)

        // node title connector Out for Compact view
        terrapinNodes.append('circle')
            .attr('class', 'terrapin-connection-point-out-compact')
            .attr('r', terrapinConfig.connectorRadius)
            .attr('cx', terrapinConfig.terrapinWidth + terrapinConfig.connectorRadius)
            .attr('cy', terrapinConfig.subjectPillowHeight / 2)
            .attr('fill', () => color(d.id));

        // node body
        terrapinNodes.append(() => {
            let body = d3.select(createElement('svg'));
            body.attr('class', 'terrapin-body')
                .attr('x', terrapinConfig.connectorRadius)
                .attr('y', d.bodyY)
            
            let id,
                objectColor,
                bodyBlock, 
                predicateBlock, 
                objectsBlock, 
                objectPillow, 
                objectText, 
                objectPillowHeight, 
                predicateBlockHeight, 
                objectsBlockHeight,
                objectPillowY,
                objectsBlockY = 0,
                predicateBlockY,
                maxHeight = 0,
                objects,
                bodyBlockY = 0,
                xOffset,
                yOffset;

            for (let predicate in d.predicates) {
                if (d.predicates.hasOwnProperty(predicate)) {
                    objects = d.predicates[predicate];
                    bodyBlock = d3.select(createElement('svg'));
                    predicateBlock = d3.select(createElement('text'));
                    objectsBlock = d3.select(createElement('svg'));
                    objectPillowY = 0;

                    for(let object in objects) {
                        objectPillow = d3.select(createElement('svg'));
                        objectText = d3.select(createElement('text'));

                        // object text create
                        objectText
                            .attr('class', 'terrapin-object-text')
                            .attr('x', terrapinConfig.contentIndent)
                            .attr('y', terrapinConfig.contentIndent)
                            .text(object)
                                .call(wrapText, terrapinConfig.objectTextWidth, terrapinConfig.objectTextMaxStrings);

                        objectPillowHeight = getSizeNotRendered(objectText).height  + terrapinConfig.contentIndent * 2;

                        objectColor = color(object);

                        // object pillow create
                        objectPillow
                            .attr('class', 'terrapin-object')
                            .append('rect')
                                .attr('class', 'terrapin-object-pillow')
                                .attr('width', terrapinConfig.objectTextWidth + terrapinConfig.contentIndent * 2 + 'px')
                                .attr('height', objectPillowHeight + 'px')
                                .attr('rx', 5)
                                .attr('fill', objectColor)

                        // connection point
                        id = d.id + terrapinConfig.tripleDelimiter + predicate + terrapinConfig.tripleDelimiter + object;
                        if (!hiddenNodes.includes(object)) {
                            objectPillow
                                .append('circle')
                                    .attr('id', id)
                                    .attr('class', 'terrapin-connection-point-out')
                                    .attr('cx', terrapinConfig.objectTextWidth + terrapinConfig.contentIndent * 2)
                                    .attr('cy', objectPillowHeight / 2)
                                    .attr('r', terrapinConfig.connectorRadius)
                                    .attr('fill', objectColor)
                        }
                        // bind data
                        xOffset = terrapinConfig.connectorRadius + terrapinConfig.predicateTextWidth + terrapinConfig.objectTextWidth + terrapinConfig.contentIndent * 4;
                        yOffset = d.bodyY + bodyBlockY + objectPillowY + terrapinConfig.contentIndent + objectPillowHeight / 2;
                        for (var i = 0, l = data.links.length; i < l; i++) {
                            if (data.links[i].fullViewSource == id) {
                                data.links[i].xOffset = xOffset;
                                data.links[i].yOffset = yOffset;
                                data.links[i].yOffsetPredicate = d.bodyY + bodyBlockY + terrapinConfig.contentIndent + terrapinConfig.subjectPillowHeight / 2;
                                break;
                            }
                        }

                        // object assembly
                        objectPillow
                            .append(() => objectText.node());
                        
                        objectPillow.on('dblclick', () => clickForHighlight(d, object, 'object'));
                        
                        objectsBlock
                            .append(() => objectPillow.node())
                                .attr('y',  objectPillowY);
                        
                        // для позиционирования террапинов по Y во время расстановки
                        d.predicates[predicate][object].yOffset = objectPillowY;
                        d.predicates[predicate][object].element = objectPillow.node();
                        objectPillow.datum(d);
                        objectPillowY += objectPillowHeight + terrapinConfig.contentIndent;
                    }

                    // predicate 
                    predicateBlock
                        .attr('x', terrapinConfig.contentIndent)
                        .attr('class', 'terrapin-predicate-text')
                        .text(predicate)
                            .call(wrapText, terrapinConfig.predicateTextWidth, terrapinConfig.predicateTextMaxStrings);

                    predicateBlockHeight = getSizeNotRendered(predicateBlock).height;
                    objectsBlockHeight = getSizeNotRendered(objectsBlock).height;

                    if (predicateBlockHeight > objectsBlockHeight) {
                        maxHeight = predicateBlockHeight + terrapinConfig.contentIndent * 2;
                        predicateBlockY = terrapinConfig.contentIndent;
                        objectsBlockY = verticalAlign(objectsBlockHeight, maxHeight, predicateBlockY);
                    } else {
                        maxHeight = objectsBlockHeight + terrapinConfig.contentIndent * 2;
                        objectsBlockY = terrapinConfig.contentIndent;
                        predicateBlockY = verticalAlign(predicateBlockHeight, maxHeight, objectsBlockY);
                    }
                    bodyBlock
                        .attr('y', bodyBlockY)
                        .attr('class', 'terrapin-body-block')
                        .append('rect')
                            .attr('width', terrapinConfig.terrapinWidth + 'px')
                            .attr('height', maxHeight + 'px')
                            .attr('class', 'terrapin-body-pillow');

                    // collapse predicate block
                    if (d.collapsiblePredicates.hasOwnProperty(predicate)) {
                        let collapsedBodyBlock = d3.select(createElement('svg')).attr('class', 'terrapin-collapsed-predicate-container')
                        let collapsedBodyBlockHeight = predicateBlockHeight + terrapinConfig.contentIndent * 4;
                        collapsedBodyBlock
                                .append('rect')
                                    .attr('class', 'terrapin-body-pillow')
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('width', terrapinConfig.terrapinWidth + 'px')
                                    .attr('height', collapsedBodyBlockHeight + 'px');
                        
                        collapsedBodyBlock
                            .append('text')
                                .attr('x', terrapinConfig.contentIndent)
                                .attr('y', verticalAlign(predicateBlockHeight, collapsedBodyBlockHeight, 0))
                                .attr('class', 'terrapin-predicate-text')
                                .text(predicate)
                                    .call(wrapText, terrapinConfig.predicateTextWidth, terrapinConfig.predicateTextMaxStrings);
                        
                        collapsedBodyBlock
                            .append('rect')
                                .attr('width', terrapinConfig.objectTextWidth + terrapinConfig.contentIndent * 2 + 'px')
                                .attr('height', terrapinConfig.subjectPillowHeight - 2 + 'px')
                                .attr('rx', 5)
                                .attr('y', terrapinConfig.contentIndent)
                                .attr('x', terrapinConfig.predicateTextWidth + terrapinConfig.contentIndent * 2)
                                .attr('class', 'terrapin-collapsed-predicate');
                        
                        collapsedBodyBlock
                            .append('circle')
                                .attr('r', terrapinConfig.connectorRadius)
                                .attr('cx', (terrapinConfig.predicateTextWidth + terrapinConfig.contentIndent * 2) * 2)
                                .attr('cy', terrapinConfig.contentIndent + terrapinConfig.subjectPillowHeight / 2)
                                .attr('class', 'terrapin-collapsed-predicate');
                        
                        bodyBlock.append(() => collapsedBodyBlock.node());

                        bodyBlock
                            .attr('id', d.collapsiblePredicates[predicate].blockId)
                            .append('circle')
                                .attr('class', 'terrapin-predicate-collapse-button')
                                .attr('cx', 0)
                                .attr('cy', 10)
                                .attr('r', 10)
                                .on('click', () => d.collapsePredicate(predicate));
                        
                        d.collapsiblePredicates[predicate].collapsedHeight = collapsedBodyBlockHeight;
                        d.collapsiblePredicates[predicate].fullHeight = maxHeight;
                    }
                    
                    bodyBlock
                        .append(() => predicateBlock.node())
                            .attr('y', predicateBlockY);

                    bodyBlock
                        .append(() => objectsBlock.node())
                            .attr('class', 'terrapin-objects-block')
                            .attr('y', objectsBlockY)
                            .attr('x', terrapinConfig.predicateTextWidth + terrapinConfig.contentIndent * 2);
                    
                    // для позиционирования элементов по Y во время расстановки
                    for(object in d.predicates[predicate]) {
                        d.predicates[predicate][object].yOffset += bodyBlockY;
                    }

                    
                    bodyBlockY += maxHeight;
                    body.append(() => bodyBlock.node());
                }
            }
            d.fullHeight = bodyBlockY + d.bodyY + 0;
            d.width = terrapinConfig.connectorRadius * 2 + terrapinConfig.predicateTextWidth + terrapinConfig.objectTextWidth + terrapinConfig.contentIndent * 4;
            return body.node();
        })

        return terrapinNodes.node();
    })
}

// links
function createLinks(links) {
    graph.links = canvas
        .append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(links)
            .enter().filter((link) => link.visible)
                .append('g')
    
    graph.links.append((link) => {
        let path = d3.select(createElement('path'));
        path.attr('fill', 'none')
            .attr('stroke', color(link.target));
        link.element = path.node();
        return path.node();
    })
}

function collapseAllNodePredicates() {
    data.nodes.forEach(d => {
        if (d.visible) {
            Object.keys(d.collapsiblePredicates).forEach(predicate => {
                if (Object.keys(d.predicates[predicate]).length > 1) d.collapsePredicate(predicate, true);
                else d.collapsePredicate(predicate, false);
            })
            
        }
    })
}


// its alive!
var simulationTerr;
var simulationForce;
function simulate(nodes, links) {
    let rectangleCollide = d3.bboxCollide((d) => {
        let box = [ 
                // top left corner
                [0 - terrapinConfig.connectorRadius, 0 - terrapinConfig.connectorRadius],
                // bottom right corner
                [d.width + terrapinConfig.connectorRadius, d.height + terrapinConfig.connectorRadius + 20]
            ];
        return box;
    });

    let forceCenter = () => {
        let force = d3.forceCenter( terrapinConfig.width / 2 - terrapinConfig.terrapinWidth / 2, terrapinConfig.height / 2 );
        return force;
    }

    simulationTerr = d3.forceSimulation()

    simulationTerr
        .nodes(nodes)
        .on('tick', tick);
    
    data.links.forEach((l) => {
        data.nodes.forEach((n) => {
            if(n.id == l.source) l.source = n;
            if(n.id == l.target) l.target = n;
        })
    })

    simulationTerr.alphaTarget(0.1);

    simulationForce = d3.forceSimulation()
        .force('collide', d3.forceCollide(terrapinConfig.forceGraphNodesRadius))
        .force('charge', d3.forceManyBody().distanceMin(1000))
        .force('link', d3.forceLink().id(d => d.id).distance(700).strength((d) => strength(d)))
        // .force("x", d3.forceX())
        // .force("y", d3.forceY())
        .force('center', forceCenter())
    
    function strength(link) {
        return 1 / (Math.min(link.source.numOfOutcomes, link.target.numOfIncomes) + 1);
    }

    simulationForce
    .nodes(nodes)
    .on('tick', tick);

    simulationForce.force('link').links(links);

    simulationForce.stop();

}

function tick() {
    updateCurvedSoftLinks();
    updateNode();
}

function updateNode() {
    let minX, minX2, minY, minY2;

    graph.nodes
        .attr('x', (d) => {
            minX = (minX) ? minX : d.x;
            minX2 = (minX2) ? minX2 : d.x2;
            minX = (d.x < minX) ? d.x : minX;
            minX2 = (d.x2 > minX2) ? d.x2 : minX2;
            return d.x;
        })
        .attr('y', (d) => {
            minY = (minY) ? minY : d.y;
            minY2 = (minY2) ? minY2 : d.y2;
            minY = (d.y < minY) ? d.y : minY;
            minY2 = (d.y2 > minY2) ? d.y2 : minY2;
            return d.y;
        })
    
    // TODO why???
    graph.x = minX;
    graph.x2 = minX2;
    graph.y = minY;
    graph.y2 = minY2;
    
    // let rectangleCollide = d3.bboxCollide(() => {
    //     let box = [ 
    //             // top left corner
    //             [0 - terrapinViewConfig.connectorRadius, 0 - terrapinViewConfig.connectorRadius],
    //             // bottom right corner
    //             [d.width + terrapinViewConfig.connectorRadius, d.height + terrapinViewConfig.connectorRadius + 20]
    //         ];
    //     return box;
    // });

    // graph.nodes.each((d) => {
    //     rectangleCollide
    // })
}

function updateCurvedSoftLinks() {
    graph.links.selectAll('path').attr('d', (d) => {
            let sourceX, sourceY;
            switch (terrapinConfig.viewType) {
                case 'compact':
                    sourceX = d.source.x + terrapinConfig.terrapinWidth + terrapinConfig.connectorRadius;
                    sourceY = d.source.y + terrapinConfig.subjectPillowHeight / 2;
                    break;
                case 'full':
                    sourceX = d.source.x + d.xOffset;
                    if (d.source.collapsiblePredicates[d.predicate] && d.source.collapsiblePredicates[d.predicate].collapsed) {
                        sourceY = d.source.y + d.yOffsetPredicate;
                    }
                    else sourceY = d.source.y + d.yOffset;
                    break;
                case 'force':
                    sourceX = d.source.x + terrapinConfig.connectorRadius;
                    sourceY = d.source.y + terrapinConfig.subjectPillowHeight / 2;
                    break;
            }
            
            let targetX = d.target.x + terrapinConfig.connectorRadius,
                targetY = d.target.y + terrapinConfig.subjectPillowHeight / 2;
            
            let intermediateX = (sourceX + targetX) / 2,
                intermediateY = (sourceY + targetY) / 2;
            
            let connectionPointsDistance = Math.abs(targetX - sourceX),
                bendIndentX = (connectionPointsDistance > 200) ? 100 : ( (connectionPointsDistance / 2 < 15 ) ? 15 : connectionPointsDistance / 2 );

            let sourceControlX = sourceX + bendIndentX,
                sourceControlY = sourceY,
                targetControlX = targetX - bendIndentX,
                targetControlY = targetY,
                intermediateControlX = intermediateX,
                intermediateControlY = intermediateY;
            
            let coords = 
                "M " + sourceX + ", " + sourceY + " " +
                "C " + sourceControlX + ", " + sourceControlY + ", " + 
                    intermediateControlX + ", " + intermediateControlY + ", " + 
                    intermediateX + ", " + intermediateY + " " +
                "S " + targetControlX + ", " + targetControlY + ", " + 
                    targetX + ", " + targetY;
            
            return coords;
        })
}

function updateCurvedSquaredLinks() {
    graph.links
        .attr('d', (d) => {
            var targetBody = document.querySelector('#' + d.target);
            var sourceBody = document.querySelector('#' + d.parent);
            var targetBodyTopY = targetBody.position().top;
            var targetBodyBottomY = targetBodyTopY + targetBody.height();
            var sourceBodyTopY = sourceBody.position().top;
            var sourceBodyBottomY = sourceBodyTopY + sourceBody.height();

            var targetPosition = targetBody.position();
            var sourcePosition = document.querySelector('#' + d.source).position();

            var sourceX = sourcePosition.left + terrapinConfig.connectorRadius / 2;
            var sourceY = sourcePosition.top - terrapinConfig.connectorRadius / 2;
            var targetX = targetPosition.left;
            var targetY = targetPosition.top  + terrapinConfig.connectorRadius;
            
            var isTargetBehind = (targetX >= sourceX) ? true : false;
            var isTargetAbove = (targetY < sourceBodyTopY) ? true : false;
            var isTargetBelow = (targetY > sourceBodyBottomY) ? true : false;
            
            var intermediateX = (sourceX + targetX) / 2;
            var intermediateY = (sourceY + targetY) / 2;
            
            var connectionPointsDistance = Math.abs(targetX - sourceX);
            var bendIndentX = (connectionPointsDistance > 200) ? 100 : ( (connectionPointsDistance / 2 < 15 ) ? 15 : connectionPointsDistance / 2 );
            var sourceControlX = sourceX + bendIndentX;
            var sourceControlY = sourceY;
            var targetControlX = targetX - bendIndentX;
            var targetControlY = targetY;
            var intermediateControlX = intermediateX;
            var intermediateControlY = intermediateY;
            
            var coords = 
                "M " + sourceX + ", " + sourceY + " " +
                "C " + sourceControlX + ", " + sourceControlY + ", " + 
                    intermediateControlX + ", " + intermediateControlY + ", " + 
                    intermediateX + ", " + intermediateY + " " +
                "S " + targetControlX + ", " + targetControlY + ", " + 
                    targetX + ", " + targetY;
                
            
            return coords;
        }).attr('whoami', (d) => d.source) // TODO kill me
}

var arrangeButton1 = document.querySelector('#arrangeButton1')
arrangeButton1.onclick = () => arrange();

// arrange
// arrange config
function createArrangeConfig(){
    let first = [];
    let middle = []; 
    let last = [];
    data.nodes.forEach((n) => {
        if (n.visible) {
            if(n.numOfIncomes == 0 || n.id.includes(terrapinConfig.arrangeFistId)) first.push(n);
        }
    })

    data.links.forEach((l) => {
        if (l.visible) {
            if (l.source.numOfIncomes != 0 && l.target.numOfOutcomes != 0) middle.push(l);
            else if (l.target.numOfOutcomes == 0) last.push(l);
        }
        
    })

    arrangeConfig = {
        first: first,
        middle: middle,
        last: last,
    }
}
// arrange
function arrange() {
    let nodesOffset = terrapinConfig.terrapinWidth + terrapinConfig.terrapinNodesOffset;
    
    data.nodes.forEach((n) => {
        n.isArranged = false;
        n.x = 0;
        n.y = 0;
    });

    arrangeConfig.first.forEach((n, i) => {
        n.x = 0;
        if(i == 0) {
            for (let key in data.links) {
                let l = data.links[key];
                if (l.source.id == n.id && !l.target.isArranged) {
                    l.target.x = snapTogrid(l.source.x + nodesOffset);
                    let yOffset = l.source.predicates[l.predicate][l.target.id].yOffset;
                    l.target.y = snapTogrid(l.source.y + yOffset);
                    let step = findNotCrossByYOffset(l.target);
                    l.target.y += step;
                    l.target.isArranged = true;
                    break
                }
            }
            n.y = 0;
        }
        else {
            n.y = snapTogrid(n.y);
            let step = findNotCrossByYOffset(n);
            n.y += step;
        }
        n.isArranged = true;
    });

    arrangeConfig.middle.forEach((l, i) => {
        if (!l.target.isArranged) {
            l.target.x = snapTogrid(l.source.x + nodesOffset);
            let yOffset = (terrapinConfig.viewType == 'full') ? l.source.predicates[l.predicate][l.target.id].yOffset : 0;
            l.target.y = snapTogrid(l.source.y + yOffset);
            let step = findNotCrossByYOffset(l.target)
            l.target.y += step;
            l.target.isArranged = true;
        }
    })

    let findMaxX = (node) => {
        let maxX = 0;
        let sourceId = ''
        data.links.forEach((l) => {
            if (sourceId != l.source.id) {
                if (l.target.id == node.id && l.source.x2 > maxX) {
                    sourceId == l.source.id;
                    maxX = l.source.x;
                }
            }

        })
        return maxX;
    }

    arrangeConfig.last.forEach((l, i) => {
        if (!l.target.isArranged) {
            l.target.x = snapTogrid(findMaxX(l.target) + nodesOffset);
            let yOffset = (terrapinConfig.viewType == 'full') ? l.source.predicates[l.predicate][l.target.id].yOffset : 0;
            l.target.y = snapTogrid(l.source.y + yOffset);
            let step = findNotCrossByYOffset(l.target);
            l.target.y += step;
            l.target.isArranged = true;
        }
    })
    
    terrapinConfig.autoArranging = true;
    linkColorsByContext(false); // CB
    tick();
}

var arrangeButton2 = document.querySelector('#arrangeButton2');
arrangeButton2.onclick = () => arrangeByContext();

// arrange by context for chatbot rules
// arrange config
function createArrangeConfigByContext(){
    let first = [];
    let middle = []; 
    let last = [];
    data.nodes.forEach((n) => {
        if (n.visible) {
            if(n.predicates.inputContext.hasOwnProperty('root') && n.predicates.nextContext.hasOwnProperty('root')) first.push(n)
        }
    })

    data.links.forEach((l) => {
        if (l.visible) {
            let isSourceInputRoot = l.source.predicates.inputContext.hasOwnProperty('root');
            let isSourceNextRoot = l.source.predicates.nextContext.hasOwnProperty('root');
            let isTargetInputRoot = l.target.predicates.inputContext.hasOwnProperty('root');
            let isTargetNextRoot = l.target.predicates.nextContext.hasOwnProperty('root');

            if ((isTargetInputRoot && !isTargetNextRoot)) middle.push(l);
            else if(!isTargetInputRoot) last.push(l);
        }
        
    })

    arrangeConfigByContext = {
        first: first,
        middle: middle,
        last: last,
    }
}
// arrange
function arrangeByContext() {
    let nodesOffset = terrapinConfig.terrapinWidth + terrapinConfig.terrapinNodesOffset;
    
    data.nodes.forEach((n) => {
        n.isArranged = false;
        n.x = 0;
        n.y = 0;
    });

    arrangeConfigByContext.first.forEach((n, i) => {
        n.x = 0;
        if(i == 0) {
            for (let key in data.links) {
                let l = data.links[key];
                if (l.source.id == n.id && !l.target.isArranged) {
                    l.target.x = snapTogrid(l.source.x + nodesOffset);
                    let yOffset = 0//l.source.predicates[l.predicate][l.target.id].yOffset : 0;
                    l.target.y = snapTogrid(l.source.y + yOffset);
                    let step = findNotCrossByYOffset(l.target);
                    l.target.y += step;
                    l.target.isArranged = true;
                    break
                }
            }
            n.y = 0;
        }
        else {
            n.y = snapTogrid(n.y);
            let step = findNotCrossByYOffset(n);
            n.y += step;
        }
        n.isArranged = true;
    });

    arrangeConfigByContext.middle.forEach((l, i) => {
        if (!l.target.isArranged) {
            l.target.x = snapTogrid(l.source.x + nodesOffset);
            let yOffset = 0;//(terrapinConfig.viewType == 'full') ? l.source.predicates[l.predicate][l.target.id].yOffset : 0;
            l.target.y = snapTogrid(l.source.y + yOffset);
            let step = findNotCrossByYOffset(l.target)
            l.target.y += step;
            l.target.isArranged = true;
        }
    })

    arrangeConfigByContext.last.forEach((l, i) => {
        if (!l.target.isArranged) {
            l.target.x = snapTogrid(l.source.x + nodesOffset);
            let yOffset = 0//(terrapinConfig.viewType == 'full') ? l.source.predicates[l.predicate][l.target.id].yOffset : 0;
            l.target.y = snapTogrid(l.source.y + yOffset);
            let step = findNotCrossByYOffset(l.target)
            l.target.y += step;
            l.target.isArranged = true;
        }
    })

    terrapinConfig.autoArranging = true;
    linkColorsByContext(true);
    tick();
}

function linkColorsByContext(yes) {
    data.links.forEach(l => {
        if (l.visible) {
            if (yes) l.element.style.stroke = color(Object.keys(l.source.predicates.nextContext)[0]);
            else l.element.style.stroke = '';
        }
    })
}

var toggleRootLinksButton = document.querySelector('#toggleRootLinksButton');
toggleRootLinksButton.onclick = () => toggleRootLinks();

var showRootLinks = false;
function toggleRootLinks() {
    showRootLinks = !showRootLinks;
    hideLinksToRoot(showRootLinks);
}

function hideLinksToRoot(yes) {
    data.links.forEach(l => {
        if (l.visible) {
            let sourceInputRoot = (Object.keys(l.source.predicates.inputContext)[0] == 'root');
            let sourceNextRoot = (Object.keys(l.source.predicates.nextContext)[0] == 'root');
            let targetInputRoot = (Object.keys(l.target.predicates.inputContext)[0] == 'root');
            let targetNextRoot = (Object.keys(l.target.predicates.nextContext)[0] == 'root');
            if ((!sourceInputRoot && sourceNextRoot && !targetNextRoot) || (targetInputRoot && targetNextRoot)) {
                if (yes) l.element.style.stroke = 'transparent';
                else l.element.style.stroke = '';
            }
        }
    })
}

function checkIntersection(){
    let node;
    graph.nodes.each((d) => {
        if(d.id == '"11111"@ru') {
            node = d3.select(d);
        }
    });
    node = node.node();
    graph.nodes.each((d) => {
        if(d.id != node.id) {
            let xIntersection = (node.x >= d.x && node.x <= d.x2 || node.x2 >= d.x && node.x2 <= d.x2) ? true : false;
            let yIntersection = (node.y >= d.y && node.y <= d.y2 || node.y2 >= d.y && node.y2 <= d.y2) ? true : false;
            // console.log('-', node.x, node.x2, node.y, node.y2)
            if(xIntersection && yIntersection) {
                // console.log(d.id, node.y, node.y2, d.y, d.y2, 'H, W:', d.height, d.width)
            }
        }
    })
}

function findNotCrossByYOffset(node){
    let newY = node.y;
    let isCross = false;
    let step = (terrapinConfig.viewType == 'compact') ? 100 : 300;
    data.nodes.sort((a, b) => a.y - b.y);
    graph.nodes.each((d) => {
        if(d.id != node.id && d.visible) {
            let newY2 = newY + node.height;
            let xCross = (node.x >= d.x && node.x <= d.x || node.x2 >= d.x && node.x2 <= d.x2
                        || d.x >= node.x && d.x <= node.x || d.x2 >= node.x && d.x2 <= node.x2) ? true : false;
            let yCross = (newY >= d.y && newY <= d.y2 || newY2 >= d.y && newY2 <= d.y2 
                        || d.y >= newY && d.y <= newY2 || d.y2 >= newY && d.y2 <= newY2) ? true : false;
            if(xCross && yCross) {
                while(true) {
                    newY += step;
                    if (newY >= d.y2) break;
                }
            }
        }
    });
    
    let yOffset = newY - node.y;
    return snapTogrid(yOffset);
}
// TODO kill me or use me
d3.selection.prototype.position = function(parent) {
    console.log('aaaaa')
    var el = this.node();
    var elPos = el.getBoundingClientRect();
    var parentPos
    if (parent) parentPos = parent.node().getBoundingClientRect();
    else parentPos = d3.select('body').node().getBoundingClientRect();

    return {
        top: elPos.top - parentPos.top,
        left: elPos.left - parentPos.left,
        width: elPos.width,
        bottom: elPos.bottom - parentPos.top,
        height: elPos.height,
        right: elPos.right - parentPos.left
    };

};

// TODO kill me or use me
function checkIsTerrapinInCanvas(d) {
    return {
        x: ( (d.x >= 0) && (d.x + d.width < terrapinConfig.width) ) ? true : false,
        y: ( (d.y >= 0) && (d.y + d.height < terrapinConfig.height) ) ? true : false
    }
}

function moveToTop(element) {
    element.parentNode.appendChild(element);
}

// drag and click nodes
function dragStarted(d) {
    // terrapinConfig.autoArranging = false; // TODO
}

function dragged(d) {
    simulationTerr.alphaTarget(0.1).restart();
    moveToTop(this);
    d3.select(this)
        .classed("dragging", true)
        .style('cursor', 'move');
    
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragEnded(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d3.event.active) simulationTerr.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d.x = snapTogrid(d.x);
    d.y = snapTogrid(d.y);
    d3.select(this)
        .classed("dragging", false)
        .style('cursor', 'default');
}

function clickForHighlight(d, id, type) {
    d3.event.stopPropagation();
    if (type == 'object') {
        for (let p in d.predicates) {
            if (d.predicates[p].hasOwnProperty(id)) {
                if (d.predicates[p][id].selected) highlightDependencies(id, false);
                else highlightDependencies(id, true);
                
            }
        }
    } else if (type = 'title') {
        if (d.selected) highlightDependencies(id, false);
        else highlightDependencies(id, true);
    }
    
}

function highlightDependencies(id, bool) {
    data.links.forEach((l) => {
        if (l.target.id == id) {
            l.selected = bool;
            l.target.selected = bool;
            l.source.predicates[l.predicate][id].selected = bool;
        }
    });
    data.nodes.forEach((n) => {
        if (n.numOfIncomes == 0 && n.id == id) {
            n.selected = bool;
        }
    })
    updateSelection();
}

function updateSelection() {
    data.links.forEach((l) => {
        d3.select(l.element).classed('active', l.selected);
        d3.select(l.target.titleElement).classed('active', l.target.selected);
        for (let p in l.source.predicates) {
            for (let obj in l.source.predicates[p]) {
                let selected = l.source.predicates[p][obj].selected;
                d3.select(l.source.predicates[p][obj].element).classed('active', selected);
            }
        }
    })
    data.nodes.forEach((n) => {
        if (n.numOfIncomes == 0) d3.select(n.titleElement).classed('active', n.selected);
    })
}


// zoom canvas
var resetZoomButton = document.querySelector('#resetZoomButton')
resetZoomButton.onclick = () => resetZoom();
function resetZoom() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}

var previousTransform = 0;
function zoomed() {
    let currentTransform = d3.event.transform;
    if (currentTransform.k > previousTransform.k) svg.style('cursor', 'zoom-in');
    if (currentTransform.k < previousTransform.k) svg.style('cursor', 'zoom-out');
    // if ((currentTransform.x - previousTransform.x) > 10 || (currentTransform.x - previousTransform.x) > 10) canvas.style('cursor', 'move');
    previousTransform = currentTransform;
    canvas.attr('transform', currentTransform);
}

function zoomEnded() {
    svg.style('cursor', 'default');
}
// TODO
function zoomToElement(element) {
    let d = element.datum();
    let scale = terrapinConfig.zoomOnElementFocus,
        x = d.x + d.width / 2,
        y = d.y + d.height / 2;
    
    svg.call(zoom.transform, transform(scale, x, y));
}

function transform(scale, x, y) {
    return d3.zoomIdentity
        .translate(terrapinConfig.width / 2, terrapinConfig.height / 2)
        .translate( 0 - (x * scale), -(y * scale))
        .scale(scale);
}

// change nodes type
var nTypeCompactButton = document.querySelector('#nTypeCompactButton');
nTypeCompactButton.onclick = () => changeNodeType('compact');

var nTypeFullButton = document.querySelector('#nTypeFullButton');
nTypeFullButton.onclick = () => changeNodeType('full');

var nTypeForceButton = document.querySelector('#nTypeForceButton');
nTypeForceButton.onclick = () => changeNodeType('force');

function changeNodeType(type) {
    switch (type) {
        case 'compact':
            terrapinConfig.viewType = type;
            $('.terrapin-title').show();
            $('.terrapin-body').hide();
            $('.terrapin-connection-point-out-compact').show();
            $('.force-nodes').hide();
            $('.terrapin-nodes').show();
            break;
        case 'full':
            terrapinConfig.viewType = type;
            $('.terrapin-title').show();
            $('.terrapin-body').show();
            $('.terrapin-connection-point-out-compact').hide();
            $('.force-nodes').hide();
            $('.terrapin-nodes').show();
            break;
        case 'force':
            terrapinConfig.viewType = type;
            $('.force-nodes').show();
            $('.terrapin-nodes').hide();
            break;
    }
    tick();
}

// change links type
/*
var changeLinksTypeButton = document.querySelector('#changeLinksTypeButton')
changeLinksTypeButton.onclick = () => changeLinksType();
function changeLinksType() {
    let max = terrapinViewConfig.possibleLinkType.length - 1;
    if (terrapinViewConfig.linkType < max) terrapinViewConfig.linkType++;
    else terrapinViewConfig.linkType = 0;
    console.log(terrapinViewConfig.possibleLinkType[terrapinViewConfig.linkType]);
}
*/

// change color
var changeColorButton = document.querySelector('#changeColorButton')
changeColorButton.onclick = () => changeColor();
function changeColor() {
    let c = $('#canvas').attr('class');
    console.log(c);
    if (c == 'colored') $('#canvas').removeClass('colored').addClass('monochrome');
    else $('#canvas').removeClass('monochrome').addClass('colored');
}


// utils
function createElement(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}
function verticalAlign(elementHeight, parentHeight, parentY) {
    return parentHeight / 2 - elementHeight / 2;
}
function getSizeNotRendered(element) {
    var svg = d3.select('body').append('svg');
    if (element.node().tagName == 'tspan') svg.append('text').append(() => {return element.node().cloneNode(true)});
    else svg.append(() => element.node().cloneNode(true));
    var size = {
            height: svg.node().getBBox().height,
            width: svg.node().getBBox().width
    }
    svg.remove();
    return size;
}
function wrapText(text, width, maxLines) {
    text.each(function () {
        var text = d3.select(this),
            letters = text.text().split('').reverse(),
            currentText,
            currentTextWidth,
            letter,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr('y');
        var x = isNaN(parseFloat(text.attr('x'))) ? 0 : parseFloat(text.attr('x'));
        var dy = 1,
            lineEndMark = ' ...',
            lineEndMarkTspan = text.text(null).append('tspan').text(lineEndMark)
            lineEndMarkWidth = getSizeNotRendered(text).width
            tspan = text.text(null).append('tspan').attr('dy', dy + 'em');

        while (letter = letters.pop()) { // letters
            line.push(letter);
            tspan.text(line.join(''));
            currentText = tspan.text();
            currentTextWidth = Math.ceil(getSizeNotRendered(tspan).width);
            if ((lineNumber + 1) < maxLines) {
                if (currentTextWidth >= width) {
                    line.pop();
                    tspan.text(line.join(''));
                    line = [letter];
                    tspan = text.append('tspan')
                        .attr('x', 0)
                        .attr('dx', x)
                        .attr('dy', ++lineNumber / 10 + lineHeight + 'em')
                        .text(letter);
                }
            } else {
                if (currentTextWidth + lineEndMarkWidth >= width) {
                    tspan.text(currentText.slice(0, currentText.length - lineEndMark.length) + lineEndMark);
                    break;
                }
            }
        }
    });
}

function snapTogrid (coord) {
    if (terrapinConfig.snapTogrid) return Math.round(coord / terrapinConfig.gridStep) * terrapinConfig.gridStep;
    else return coord;
}

function toLowerCase(str) {
    let result = str;
    if (typeof(str) == 'string') {
        result = '';
        for( let i = 0, l = str.length; i < l; i++) {
            try {
                result += str[i].toLowerCase();
            } catch (error) {
                result += str[i];
            }
        }
    }
    return result;
}

/*
     - zoom & minimap
     - curve links
     - highlight
*/


var testButton1 = document.querySelector('#testButton1');
var testButton2 = document.querySelector('#testButton2');
// testButton1.onclick = () => checkIntersection();
testButton1.onclick = () => simulationForce.alphaTarget(0.1).restart();
testButton2.onclick = () => simulationForce.stop();