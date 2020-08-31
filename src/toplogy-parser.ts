import {FlowElement} from "react-flow-renderer/dist/types";

const input = "Topologies:\n" +
  "   Sub-topology: 0\n" +
  "    Source: KSTREAM-SOURCE-0000000000 (topics: [a])\n" +
  "      --> lenght-filter\n" +
  "    Processor: lenght-filter (stores: [])\n" +
  "      --> KSTREAM-MAPVALUES-0000000002\n" +
  "      <-- KSTREAM-SOURCE-0000000000\n" +
  "    Processor: KSTREAM-MAPVALUES-0000000002 (stores: [])\n" +
  "      --> KSTREAM-KEY-SELECT-0000000003\n" +
  "      <-- lenght-filter\n" +
  "    Processor: KSTREAM-KEY-SELECT-0000000003 (stores: [])\n" +
  "      --> KSTREAM-FILTER-0000000007\n" +
  "      <-- KSTREAM-MAPVALUES-0000000002\n" +
  "    Processor: KSTREAM-FILTER-0000000007 (stores: [])\n" +
  "      --> KSTREAM-SINK-0000000006\n" +
  "      <-- KSTREAM-KEY-SELECT-0000000003\n" +
  "    Sink: KSTREAM-SINK-0000000006 (topic: KSTREAM-AGGREGATE-STATE-STORE-0000000004-repartition)\n" +
  "      <-- KSTREAM-FILTER-0000000007\n" +
  "\n" +
  "  Sub-topology: 1\n" +
  "    Source: KSTREAM-SOURCE-0000000008 (topics: [KSTREAM-AGGREGATE-STATE-STORE-0000000004-repartition])\n" +
  "      --> KSTREAM-AGGREGATE-0000000005\n" +
  "    Processor: KSTREAM-AGGREGATE-0000000005 (stores: [KSTREAM-AGGREGATE-STATE-STORE-0000000004])\n" +
  "      --> KTABLE-TOSTREAM-0000000009\n" +
  "      <-- KSTREAM-SOURCE-0000000008\n" +
  "    Processor: KTABLE-TOSTREAM-0000000009 (stores: [])\n" +
  "      --> KSTREAM-BRANCH-0000000010\n" +
  "      <-- KSTREAM-AGGREGATE-0000000005\n" +
  "    Processor: KSTREAM-BRANCH-0000000010 (stores: [])\n" +
  "      --> KSTREAM-BRANCHCHILD-0000000011, KSTREAM-BRANCHCHILD-0000000012, KSTREAM-BRANCHCHILD-0000000013\n" +
  "      <-- KTABLE-TOSTREAM-0000000009\n" +
  "    Processor: KSTREAM-BRANCHCHILD-0000000011 (stores: [])\n" +
  "      --> KSTREAM-SINK-0000000014\n" +
  "      <-- KSTREAM-BRANCH-0000000010\n" +
  "    Processor: KSTREAM-BRANCHCHILD-0000000012 (stores: [])\n" +
  "      --> KSTREAM-SINK-0000000015\n" +
  "      <-- KSTREAM-BRANCH-0000000010\n" +
  "    Processor: KSTREAM-BRANCHCHILD-0000000013 (stores: [])\n" +
  "      --> KSTREAM-SINK-0000000016\n" +
  "      <-- KSTREAM-BRANCH-0000000010\n" +
  "    Sink: KSTREAM-SINK-0000000014 (topic: 0)\n" +
  "      <-- KSTREAM-BRANCHCHILD-0000000011\n" +
  "    Sink: KSTREAM-SINK-0000000015 (topic: 1)\n" +
  "      <-- KSTREAM-BRANCHCHILD-0000000012\n" +
  "    Sink: KSTREAM-SINK-0000000016 (topic: 2)\n" +
  "      <-- KSTREAM-BRANCHCHILD-0000000013\n" +
  "\n" +
  "  Sub-topology: 2 for global store (will not generate tasks)\n" +
  "    Source: KSTREAM-SOURCE-0000000017 (topics: [customer])\n" +
  "      --> KTABLE-SOURCE-0000000018\n" +
  "    Processor: KTABLE-SOURCE-0000000018 (stores: [c])\n" +
  "      --> none\n" +
  "      <-- KSTREAM-SOURCE-0000000017"


function convertToElement(stringInput: string) {

  var edgesRegex = /(?:.+(-->|<--)\s(.+))/g
  var nodeRegex = /\s+(\w+):\s+(.+)\s\((.+\w{0,})\)/g
  var edges = [...stringInput.matchAll(edgesRegex)]

  var node = [...stringInput.matchAll(nodeRegex)][0]


  var guiEdges = edges
    .filter(v => v[1].localeCompare("-->") == 0)
    .flatMap(v =>
      v[2].split(",")
        .filter(v => "none".localeCompare(v) != 0)
        .map(e => [...v, e]))
    .map(v => {
      return {
        id: 'edge:' + node[2] + '-->' + v[3],
        source: node[2],
        target: v[3].trim(),
        animated: true,
        arrowHeadType: 'arrow',
      }
    })

  var guiNode = {
    id: node[2],
    data: {label: node[2]},
    position: {x: 0, y: 0}
  }

  var children = edges
    .filter(v => v[1].localeCompare("-->") == 0)
    .flatMap(v => v[2].split(","))
    .filter(v => "none".localeCompare(v) != 0)
    .map(v => v.trim())


  var parents = edges
    .filter(v => v[1].localeCompare("<--") == 0)
    .flatMap(v => v[2].split(","))
    .filter(v => "none".localeCompare(v) != 0)
    .map(v => v.trim())


  return {nodeName: node[2], parents: parents, children: children, guiNode: guiNode, guiEdges: guiEdges};
}


function processTree(treeElements: RegExpMatchArray): Array<FlowElement> {

  const nodeMap = treeElements
    .flatMap(e => convertToElement(e))
    .reduce((map, element) => {
      map.set(element.nodeName, element)
      return map
    }, new Map())


  var sortedByParentSize = [...nodeMap.values()].sort((a, b) => a.parents.length - b.parents.length)

  const depthIncrement = 100;
  const widthIncrement = 200;

  var largestWidth = 0;

  function setPositions(depth: number, width: number, node: any) {
    if (width > largestWidth) largestWidth = width
    node.guiNode.position = {x: width, y: depth}
    node.visited = true
    for (let i = 0; i < node.children.length; i++) {
      setPositions(depth + depthIncrement, width + i * widthIncrement, nodeMap.get(node.children[i]))
    }
  }

  for (let i = 0; i < sortedByParentSize.length; i++) {
    if (!sortedByParentSize[i].visited) {
      setPositions(0, largestWidth + (i > 0 ? 1 : 0) * widthIncrement, nodeMap.get(sortedByParentSize[i].nodeName))
    }
  }

  return [...nodeMap.values()].flatMap(e => [e.guiNode, ...e.guiEdges]);
}

export function getTopology(inputString: string = input): Array<FlowElement> {
  var re3 = /(.+:.+)(\n.+--.+)+/g
  var treeElements = inputString.match(re3)
  if (treeElements != null) {
    return processTree(treeElements);
  } else {
    return []
  }
}

