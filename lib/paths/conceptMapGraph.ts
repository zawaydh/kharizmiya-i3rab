export type ConceptMapAnswer = {
  text?: string;
  next?: string;
  nextByFact?: {
    map?: Record<string, string>;
    default?: string;
  };
};

export type ConceptMapNode = {
  id: string;
  answers?: ConceptMapAnswer[];
};

export type ConceptMapTree = {
  startNodeId: string;
  nodes: Record<string, ConceptMapNode>;
};

export type ConceptMapEdge = {
  from: string;
  to: string;
  label?: string;
};

export function buildConceptMapGraph(tree: ConceptMapTree) {
  const childrenMap = new Map<string, string[]>();
  const edges: ConceptMapEdge[] = [];
  const edgeKeys = new Set<string>();

  Object.values(tree.nodes).forEach((node) => {
    const children: string[] = [];

    (node.answers || []).forEach((answer) => {
      const destinations = Array.from(
        new Set(
          [
            answer.next,
            ...Object.values(answer.nextByFact?.map || {}),
            answer.nextByFact?.default,
          ].filter((value): value is string => Boolean(value))
        )
      );

      destinations.forEach((destination) => {
        if (destination === node.id || !tree.nodes[destination]) return;
        if (!children.includes(destination)) children.push(destination);

        const label = answer.text || "";
        const edgeKey = `${node.id}->${destination}:${label}`;
        if (edgeKeys.has(edgeKey)) return;
        edgeKeys.add(edgeKey);
        edges.push({ from: node.id, to: destination, label });
      });
    });

    childrenMap.set(node.id, children);
  });

  return { childrenMap, edges };
}
