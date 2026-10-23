import type { FlowGraphNode, FlowGraphEdge } from "@/lib/types";

export interface LayoutOptions {
  direction?: "TB" | "LR";
  nodeWidth?: number;
  nodeHeight?: number;
  rankSeparation?: number;
  nodeSeparation?: number;
  componentSeparation?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: "TB",
  nodeWidth: 250,
  nodeHeight: 76,
  rankSeparation: 120,
  nodeSeparation: 50,
  componentSeparation: 90,
};

/**
 * Deterministically lays out code dependency graphs using a layered DAG algorithm.
 *
 * Guarantees:
 * 1. Reproducible node placement for identical graph inputs.
 * 2. Proper handling and isolation of disconnected subgraphs.
 * 3. Topological ranking (callers/tests upstream, callees downstream).
 * 4. Cycle resilience (breaking back-edges during ranking).
 * 5. Barycenter ordering to minimize edge crossings.
 */
export function applyDeterministicLayout(
  nodes: FlowGraphNode[],
  edges: FlowGraphEdge[],
  options?: LayoutOptions
): FlowGraphNode[] {
  if (!nodes || nodes.length === 0) return [];

  const opts: Required<LayoutOptions> = { ...DEFAULT_OPTIONS, ...options };
  const isTB = opts.direction === "TB";

  const nodeMap = new Map<string, FlowGraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n, position: { ...n.position } }));

  // Filter edges to only valid node connections
  const validEdges = edges.filter(
    (e) => nodeMap.has(e.source) && nodeMap.has(e.target) && e.source !== e.target
  );

  // 1. Partition into Weakly Connected Components using Undirected Adjacency
  const adj = new Map<string, Set<string>>();
  nodes.forEach((n) => adj.set(n.id, new Set()));
  validEdges.forEach((e) => {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  });

  const visited = new Set<string>();
  const components: string[][] = [];

  // Sort node IDs for deterministic exploration order
  const sortedNodeIds = Array.from(nodeMap.keys()).sort();

  for (const startId of sortedNodeIds) {
    if (visited.has(startId)) continue;
    const component: string[] = [];
    const queue: string[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);
      const neighbors = Array.from(adj.get(current) || []).sort();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    // Deterministic sort inside component
    component.sort();
    components.push(component);
  }

  // Sort components: largest first, then by earliest node ID
  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));

  // 2. Lay out each component independently
  let compOffsetX = 40;
  let compOffsetY = 40;

  for (const compNodeIds of components) {
    const compNodeSet = new Set(compNodeIds);
    const compEdges = validEdges.filter(
      (e) => compNodeSet.has(e.source) && compNodeSet.has(e.target)
    );

    // Build directed adjacency and in-degree map for this component
    const outEdges = new Map<string, string[]>();
    const inEdges = new Map<string, string[]>();
    compNodeIds.forEach((id) => {
      outEdges.set(id, []);
      inEdges.set(id, []);
    });

    compEdges.forEach((e) => {
      outEdges.get(e.source)?.push(e.target);
      inEdges.get(e.target)?.push(e.source);
    });

    // 3. Assign Topological Ranks with Cycle Breaking
    const ranks = new Map<string, number>();
    const inDegrees = new Map<string, number>();
    compNodeIds.forEach((id) => {
      inDegrees.set(id, inEdges.get(id)?.length || 0);
    });

    // Start with in-degree 0 nodes (entry points, tests, top-level callers)
    const roots = compNodeIds.filter((id) => inDegrees.get(id) === 0).sort();
    const rankQueue: Array<{ id: string; rank: number }> = [];

    if (roots.length > 0) {
      roots.forEach((id) => rankQueue.push({ id, rank: 0 }));
    } else {
      // Component is entirely cyclic; break tie with alphabetically first node
      rankQueue.push({ id: compNodeIds[0], rank: 0 });
    }

    const rankVisited = new Set<string>();
    while (rankQueue.length > 0) {
      const { id, rank } = rankQueue.shift()!;
      const currentRank = ranks.get(id) ?? -1;
      if (rank > currentRank) {
        ranks.set(id, rank);
      }
      if (rankVisited.has(id)) continue;
      rankVisited.add(id);

      const targets = (outEdges.get(id) || []).slice().sort();
      for (const target of targets) {
        rankQueue.push({ id: target, rank: (ranks.get(id) ?? 0) + 1 });
      }
    }

    // Ensure all nodes have a rank
    compNodeIds.forEach((id) => {
      if (!ranks.has(id)) ranks.set(id, 0);
    });

    // 4. Group Nodes into Ranks
    const rankGroups = new Map<number, string[]>();
    compNodeIds.forEach((id) => {
      const r = ranks.get(id) ?? 0;
      if (!rankGroups.has(r)) rankGroups.set(r, []);
      rankGroups.get(r)!.push(id);
    });

    const maxRank = Math.max(...Array.from(rankGroups.keys()), 0);

    // 5. Barycenter Crossing Reduction: Sort nodes within each rank by parent index
    for (let r = 1; r <= maxRank; r++) {
      const prevRankNodes = rankGroups.get(r - 1) || [];
      const prevIndexMap = new Map<string, number>();
      prevRankNodes.forEach((id, idx) => prevIndexMap.set(id, idx));

      const currentRankNodes = rankGroups.get(r) || [];
      currentRankNodes.sort((a, b) => {
        const aParents = inEdges.get(a) || [];
        const bParents = inEdges.get(b) || [];

        const aAvg =
          aParents.length > 0
            ? aParents.reduce((sum, p) => sum + (prevIndexMap.get(p) ?? 0), 0) / aParents.length
            : 0;
        const bAvg =
          bParents.length > 0
            ? bParents.reduce((sum, p) => sum + (prevIndexMap.get(p) ?? 0), 0) / bParents.length
            : 0;

        if (aAvg !== bAvg) return aAvg - bAvg;
        return a.localeCompare(b);
      });
      rankGroups.set(r, currentRankNodes);
    }

    // 6. Calculate Coordinates for This Component
    let maxRankWidth = 0;
    for (let r = 0; r <= maxRank; r++) {
      const count = rankGroups.get(r)?.length || 0;
      const width = count * (opts.nodeWidth + opts.nodeSeparation);
      if (width > maxRankWidth) maxRankWidth = width;
    }

    for (let r = 0; r <= maxRank; r++) {
      const nodesInRank = rankGroups.get(r) || [];
      const rankNodeCount = nodesInRank.length;
      const totalRankSpan =
        rankNodeCount * (opts.nodeWidth + opts.nodeSeparation) - opts.nodeSeparation;
      const startCoord = (maxRankWidth - totalRankSpan) / 2;

      nodesInRank.forEach((nodeId, idx) => {
        const node = nodeMap.get(nodeId);
        if (!node) return;

        if (isTB) {
          const x = compOffsetX + startCoord + idx * (opts.nodeWidth + opts.nodeSeparation);
          const y = compOffsetY + r * (opts.nodeHeight + opts.rankSeparation);
          node.position = { x: Math.round(x), y: Math.round(y) };
        } else {
          const x = compOffsetX + r * (opts.nodeWidth + opts.rankSeparation);
          const y = compOffsetY + startCoord + idx * (opts.nodeHeight + opts.nodeSeparation);
          node.position = { x: Math.round(x), y: Math.round(y) };
        }
      });
    }

    // Advance component offset
    if (isTB) {
      compOffsetX += maxRankWidth + opts.componentSeparation;
    } else {
      const compHeight = (maxRank + 1) * (opts.nodeHeight + opts.rankSeparation);
      compOffsetY += compHeight + opts.componentSeparation;
    }
  }

  return Array.from(nodeMap.values());
}
