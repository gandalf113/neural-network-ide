import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    Position,
    Node,
    Edge,
    Handle,
    ControlButton
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {NodeData, NodeState, useGameStore} from "../store/gameStore";
import {NodeChange, Connection} from "@xyflow/system";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import type {OnDelete} from "@xyflow/react/dist/esm/types";

type FlowNodeData = {
    label?: string;
    bias?: number;
    inputValue: number;
    outputValue: number;
    activation?: string;
    type?: string;
}

const CustomNode = ({data, selected}: { data: FlowNodeData; type: string, selected?: boolean }) => {
    const {type} = data;
    const color = "#555555";

    return (
        <div
            style={{
                outline: selected ? "2px dashed #333" : "1px solid #333",
                width: 120,
                background: selected ? "#333" : "#222",
                color: "#FFF",
                borderRadius: "5px",
                fontSize: "12px",
                opacity: Math.max(0.2, data.outputValue),
            }}
        >
            <div
                style={{
                    background: color,
                    color: "#FFF",
                    padding: "4px",
                    fontWeight: "bold",
                    borderTopLeftRadius: "5px",
                    borderTopRightRadius: "5px",
                    textAlign: "center",
                }}
                onClick={() => console.log(data)}
            >
                {data.label}
                {type !== "input" && <span>: {data.bias!.toFixed(2)}</span>}
            </div>
            {type !== "input" && (
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{background: "#FFF", top: "50%"}}
                />
            )}
            <div style={{display: "flex", justifyContent: "space-around", padding: "4px"}}>
                <div>In: {data.inputValue.toFixed(2)}</div>
                <div>Out: {data.outputValue.toFixed(2)}</div>
            </div>
            {type != 'input' && <div style={{textAlign: "center", padding: "4px", borderTop: "1px solid #333"}}>
                {data.activation}
            </div>}
            {type !== "output" && (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{background: "#FFF", top: "50%"}}
                />
            )}
        </div>
    );
};


const mapToReactFlowNode = (node: NodeData, nodeStates: Record<string, NodeState>): Node => {
    const nodeType = node.type;

    const data = nodeType != "input" ? {
        label: node.id,
        bias: node.bias,
        inputValue: nodeStates[node.id]?.inputValue || 0,
        outputValue: nodeStates[node.id]?.outputValue || 0,
        activation: node.activation,
        type: node.type,
    } : {
        label: node.id,
        inputValue: nodeStates[node.id]?.inputValue || 0,
        outputValue: nodeStates[node.id]?.outputValue || 0,
        type: node.type,
    };

    return {
        id: node.id,
        type: "custom",
        position: {x: node.x, y: node.y},
        data: data,
    }
}

const mapToReactFlowEdges = (nodes: NodeData[]): Edge[] =>
    nodes.flatMap((node) =>
        (node.connections || []).map((connection, index) => ({
            id: `${node.id}-${connection.targetId}-${index}`,
            source: node.id,
            target: connection.targetId,
            label: `w: ${connection.weight.toFixed(2)}`,
            animated: true,
            style: {stroke: "#FFF"},
        }))
    );

const NeuralNetworkConfigurer: React.FC = () => {
    const {networkNodes, updateNetworkNodes, nodeStates} = useGameStore();
    const edges = useMemo(() => mapToReactFlowEdges(networkNodes), [networkNodes]);
    const [nodes, setNodes, onNodesChange] = useNodesState(
        networkNodes.map((node) => mapToReactFlowNode(node, nodeStates))
    );

    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (hoveredNode) {
                const node = networkNodes.find((n) => n.id === hoveredNode);
                if (node && node.type != "input") {
                    node.bias += e.deltaY > 0 ? 0.01 : -0.01;
                    updateNetworkNodes([...networkNodes]);
                }
            } else if (hoveredEdge) {
                const [sourceId, targetId] = hoveredEdge.split("-");
                networkNodes.forEach((node) => {
                    node.connections?.forEach((connection) => {
                        if (connection.sourceId === sourceId && connection.targetId === targetId) {
                            connection.weight += e.deltaY > 0 ? 0.01 : -0.01;
                        }
                    });
                });
                updateNetworkNodes([...networkNodes]);
            }
        },
        [hoveredNode, hoveredEdge, networkNodes, updateNetworkNodes]
    );

    const handleNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => {
            const filteredChanges = changes.filter((change) => {
                if (change.type === "remove") {
                    const nodeToRemove = nodes.find((node) => node.id === change.id);
                    return nodeToRemove?.data.type !== "input" && nodeToRemove?.data.type !== "output";
                }
                return true;
            });

            onNodesChange(filteredChanges);
        },
        [onNodesChange, nodes]
    );

    const onConnect = useCallback(
        (params: Connection) => {
            const sourceNode = networkNodes.find((node) => node.id === params.source);
            const targetNode = networkNodes.find((node) => node.id === params.target);
            if (sourceNode && targetNode) {
                sourceNode.connections = [
                    ...(sourceNode.connections || []),
                    {sourceId: sourceNode.id, targetId: targetNode.id, weight: 1},
                ];
                updateNetworkNodes([...networkNodes]);
            }
        },
        [networkNodes, updateNetworkNodes]
    );

    const onDelete = useCallback(
        (params: OnDelete<Node, Connection>) => {
            const deletedNodeIds = params.nodes.map((node: Node) => node.id);
            const deletedEdgeIds = params.edges.map((edge: Edge) => edge.id);

            const updatedNodes = networkNodes.filter((node) => !deletedNodeIds.includes(node.id));
            updatedNodes.forEach((node) => {
                node.connections = (node.connections || []).filter((connection) => !deletedEdgeIds.includes(`${node.id}-${connection.targetId}`));
            });

            updateNetworkNodes(updatedNodes);
        },
        [networkNodes, updateNetworkNodes]
    );

    useEffect(() => {
        setNodes((currentNodes) =>
            currentNodes.map((node) => {
                if (nodeStates[node.id] !== undefined) {
                    const data: FlowNodeData = {
                        ...node.data,
                        inputValue: nodeStates[node.id]?.inputValue || 0,
                        outputValue: nodeStates[node.id]?.outputValue || 0
                    };

                    if (node.type !== "input") {
                        data.bias = networkNodes.filter((n) => n.type !== "input").find((n) => n.id === node.id)?.bias || 0;
                    }

                    return {
                        ...node,
                        data
                    };
                }
                return node;
            }));
    }, [nodeStates, networkNodes, setNodes]);

    return (
        <div style={{width: "100%", height: "100vh", background: "#111", position: "relative"}} onWheel={handleWheel}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                nodeTypes={{custom: CustomNode}}
                fitView
                zoomOnScroll={false}
                onNodeMouseEnter={(_, node) => setHoveredNode(node.id)}
                onNodeMouseLeave={() => setHoveredNode(null)}
                onEdgeMouseEnter={(_, edge) => setHoveredEdge(edge.id)}
                onEdgeMouseLeave={() => setHoveredEdge(null)}
                onConnect={onConnect}
                onDelete={onDelete}
            >
                <Controls position={"top-left"} orientation={"vertical"} showInteractive={false} showZoom={false}>
                    <ControlButton
                        onClick={() => {
                            const newNode: NodeData = {
                                id: `Hidden${networkNodes.length}`,
                                type: "hidden",
                                x: 450,
                                y: 300,
                                activation: "sigmoid",
                                bias: 0,
                            };

                            const updatedNodes = [...networkNodes, newNode];
                            updateNetworkNodes(updatedNodes);

                            setNodes((currentNodes) => [
                                ...currentNodes,
                                mapToReactFlowNode(newNode, nodeStates),
                            ]);
                        }}
                    >
                        +
                    </ControlButton>
                </Controls>
                <Background color="#222" gap={16}/>
            </ReactFlow>
            <div
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "#FFF",
                    padding: "10px",
                    borderRadius: "5px",
                    fontSize: "12px"
                }}
            >
                <strong>Legend:</strong>
                <ul style={{listStyleType: "none", padding: 0}}>
                    <li>Ctrl + Scroll: Adjust weights and biases</li>
                    <li>Backspace: Delete node</li>
                    <li>Drag: Move nodes</li>
                    <li>Connect nodes: Drag edges</li>
                </ul>
            </div>
        </div>
    );
};

export default NeuralNetworkConfigurer;
