import {create} from "zustand";
import {processNeuralNetwork} from "../utils/NeuralNetworkProcessor";

export interface PlayerActions {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
}

export type ConnectionData = { sourceId: string, targetId: string; weight: number }

interface InputNodeData {
    id: string;
    type: "input";
    x: number;
    y: number;
    connections?: ConnectionData[];
}

interface LayerNodeData {
    id: string;
    type: "hidden" | "output";
    x: number;
    y: number;
    activation: string;
    bias: number;
    connections?: ConnectionData[];
}

export type NodeData = InputNodeData | LayerNodeData;

export interface GameState {
    observation: Record<string, number>;
    isOver: boolean;
    controlMode: "neural-network" | "keyboard";
    playerActions: PlayerActions;
}

export interface NodeState {
    inputValue: number;
    outputValue: number;
}


export interface GameStore {
    gameState: GameState;
    networkNodes: NodeData[];
    nodeStates: Record<string, NodeState>;
    updateNetworkNodes: (nodes: NodeData[]) => void;
    updateObservation: (observation: Record<string, number>) => void;
    recalculateOutputs: () => void;
    initializeNodes: () => void;
}

const defaultNodes: NodeData[] = [
    {
        "id": "ForwardHit",
        "type": "input",
        "x": 100,
        "y": 60,
        "connections": [
            {
                "sourceId": "ForwardHit",
                "targetId": "Hidden1",
                "weight": -1.312374472618103
            },
            {
                "sourceId": "ForwardHit",
                "targetId": "Hidden2",
                "weight": -0.21040841937065125
            }
        ]
    },
    {
        "id": "RightHit",
        "type": "input",
        "x": 100,
        "y": 120,
        "connections": [
            {
                "sourceId": "RightHit",
                "targetId": "Hidden1",
                "weight": 1.0978878736495972
            },
            {
                "sourceId": "RightHit",
                "targetId": "Hidden2",
                "weight": -3.6460912227630615
            }
        ]
    },
    {
        "id": "LeftHit",
        "type": "input",
        "x": 100,
        "y": 180,
        "connections": [
            {
                "sourceId": "LeftHit",
                "targetId": "Hidden1",
                "weight": -3.113811492919922
            },
            {
                "sourceId": "LeftHit",
                "targetId": "Hidden2",
                "weight": 1.0425070524215698
            }
        ]
    },
    {
        "id": "Hidden1",
        "type": "hidden",
        "x": 450,
        "y": 0,
        "activation": "sigmoid",
        "bias": 1.9063713550567627,
        "connections": [
            {
                "sourceId": "Hidden1",
                "targetId": "Left",
                "weight": 1.785682678222656,
            },
            {
                "sourceId": "Hidden1",
                "targetId": "Right",
                "weight": -5.199692726135254
            }
        ]
    },
    {
        "id": "Hidden2",
        "type": "hidden",
        "x": 450,
        "y": 200,
        "activation": "sigmoid",
        "bias": 1.4540787935256958,
        "connections": [
            {
                "sourceId": "Hidden2",
                "targetId": "Left",
                "weight": -4.081671714782715
            },
            {
                "sourceId": "Hidden2",
                "targetId": "Right",
                "weight": 2.927220106124878
            }
        ]
    },
    {
        "id": "Left",
        "type": "output",
        "x": 850,
        "y": 50,
        "activation": "step",
        "bias": 0.24100065231323242
    },
    {
        "id": "Right",
        "type": "output",
        "x": 850,
        "y": 150,
        "activation": "step",
        "bias": 0.26800012588500977
    }
];

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: {
        observation: {},
        isOver: false,
        controlMode: "neural-network",
        playerActions: {forward: false, backward: false, left: false, right: false},
    },
    networkNodes: defaultNodes,
    nodeStates: {},
    updateNetworkNodes: (nodes) => {
        set({networkNodes: nodes});
        get().recalculateOutputs();
    },
    updateObservation: (observation) => {
        set((state) => ({gameState: {...state.gameState, observation}}));
        get().recalculateOutputs();
    },
    recalculateOutputs: () => {
        const {networkNodes, gameState} = get();

        try {
            const outputs = processNeuralNetwork(networkNodes, gameState.observation);
            set({nodeStates: outputs});
        } catch (e) {
            console.error("Error processing neural network", e);
        }
    },
    initializeNodes: () => {
        set({networkNodes: defaultNodes});
        get().recalculateOutputs();
    },
}));