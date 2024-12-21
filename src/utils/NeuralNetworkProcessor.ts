import {ConnectionData, NodeData} from "../store/gameStore";

// Define activation functions
const activationFunctions: Record<string, (x: number) => number> = {
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    step: (x: number) => (x > 0.5 ? 1 : 0),
    softmax: (x: number) => x, // placeholder
};

export const processNeuralNetwork = (
    nodes: NodeData[],
    observations: Record<string, number>
): Record<string, { inputValue: number; outputValue: number }> => {
    // Create a lookup for nodes by ID
    const nodeById: Record<string, NodeData> = {};
    nodes.forEach((node) => {
        nodeById[node.id] = node;
    });

    // Build outEdges (for topological sort) and inEdges (for input summation)
    const outEdges: Record<string, ConnectionData[]> = {};
    const inEdges: Record<string, ConnectionData[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach((node) => {
        outEdges[node.id] = node.connections || [];

        // Initialize in-degree
        if (inDegree[node.id] === undefined) inDegree[node.id] = 0;

        // Populate inEdges from outEdges
        (node.connections || []).forEach((conn) => {
            // For topological ordering
            if (inDegree[conn.targetId] === undefined) {
                inDegree[conn.targetId] = 0;
            }
            inDegree[conn.targetId]++;

            // Build reverse mapping for incoming edges
            if (!inEdges[conn.targetId]) {
                inEdges[conn.targetId] = [];
            }
            // Add this connection as incoming to targetId
            inEdges[conn.targetId].push({
                ...conn,
                sourceId: node.id,
            });
        });
    });

    // Identify the starting nodes
    const queue: string[] = [];
    Object.keys(inDegree).forEach((id) => {
        if (inDegree[id] === 0) {
            queue.push(id);
        }
    });

    const nodeStates: Record<string, { inputValue: number; outputValue: number }> = {};

    // Initialize input nodes
    nodes.forEach((node) => {
        if (node.type === "input") {
            const val = observations[node.id] !== undefined ? observations[node.id] : 0;
            nodeStates[node.id] = {
                inputValue: val,
                outputValue: val,
            };
        }
    });

    // Process nodes in topological order
    while (queue.length > 0) {
        try {

            const nodeId = queue.shift()!;
            const node = nodeById[nodeId];

            if (node.type !== "input") {
                // Compute input sum using inEdges
                const incoming = inEdges[nodeId] || [];
                let inputSum = node.bias || 0;

                incoming.forEach((conn) => {
                    const sourceOutput = nodeStates[conn.sourceId]?.outputValue || 0;
                    inputSum += sourceOutput * conn.weight;
                });

                // Apply activation
                const activationFn = activationFunctions[node.activation];
                const outputValue = activationFn ? activationFn(inputSum) : inputSum;

                nodeStates[nodeId] = {
                    inputValue: inputSum,
                    outputValue,
                };
            }

            // Decrement inDegree of successors
            outEdges[nodeId].forEach((edge) => {
                inDegree[edge.targetId]--;
                if (inDegree[edge.targetId] === 0) {
                    queue.push(edge.targetId);
                }
            });
        } catch {
            break;
        }
    }

    return nodeStates;
};
