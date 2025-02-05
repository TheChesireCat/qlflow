"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Connection,
    MarkerType,
    ReactFlowProvider,
    ReactFlowInstance,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import TableNode from "@/components/nodes/TableNode";
import { SaveIcon, UploadIcon, CopyIcon, ClipboardCopyIcon, SquarePlusIcon, SquareXIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "./ui/toaster";
import { Input } from "./ui/input";
import { TableNodeData } from "@/components/nodes/TableNode";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Map node types to your custom component.
const nodeTypes = {
    tableNode: TableNode,
};

// Note that we now include an `id` field inside the data for each node.
const initialNodes: Node<TableNodeData>[] = [
    {
        id: "1",
        type: "tableNode",
        position: { x: 0, y: 0 },
        data: {
            id: "1",
            tableAlias: "Users",
            dataset: "myapp",
            schema: "public",
            tableName: "users",
            createStatement:
                "CREATE TABLE Users (\n  id INT PRIMARY KEY,\n  name VARCHAR(255),\n  email VARCHAR(255)\n);",
            query: "SELECT * FROM Users;",
        },
    },
    {
        id: "2",
        type: "tableNode",
        position: { x: 1000, y: 0 },
        data: {
            id: "2",
            tableAlias: "Orders",
            dataset: "myapp",
            schema: "public",
            tableName: "orders",
            createStatement:
                "CREATE TABLE Orders (\n  id INT PRIMARY KEY,\n  user_id INT,\n  total DECIMAL(10, 2),\n  FOREIGN KEY (user_id) REFERENCES Users(id)\n);",
            query: "SELECT o.* FROM Orders o\nJOIN Users u ON o.user_id = u.id;",
        },
    },
];

const initialEdges: Edge[] = [
    {
        id: "e1-2",
        source: "1",
        target: "2",
        markerEnd: {
            type: MarkerType.Arrow,
        },
    },
];

export default function TableFlowVisualization() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node<TableNodeData>, Edge> | null>(null);
    const { setViewport } = useReactFlow();
    const [project, setProject] = useState("DEFAULT_PROJECT_FLOW");
    const { toast } = useToast();

    // Callback to update a node's data in the parent state.
    const updateNodeData = useCallback(
        (nodeId: string, newData: Partial<TableNodeData>) => {
            // console.log("updateNodeData", nodeId, newData);
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === nodeId
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                ...newData,
                                // Ensure that onDataChange is maintained.
                                onDataChange: updateNodeData,
                                // Also ensure the data id matches the node id.
                                id: nodeId,
                            },
                        }
                        : node
                )
            );
            //   console.log("nodes", nodes);
        },
        [setNodes]
    );

    // On mount, inject the onDataChange callback into each node's data.
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, onDataChange: updateNodeData, id: node.id },
            }))
        );
    }, [updateNodeData, setNodes]);

    const onConnect = useCallback(
        (connection: Edge | Connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    const addNode = useCallback(() => {
        const newId = `${nodes.length + 1}`;
        const newNode: Node<TableNodeData> = {
            id: newId,
            type: "tableNode",
            position: { x: Math.random() * 800, y: Math.random() * 600 },
            data: {
                id: newId, // Include the id in the data.
                tableAlias: "New Table",
                dataset: "myapp",
                schema: "public",
                tableName: "new_table",
                createStatement: "CREATE TABLE NewTable (\n  id INT PRIMARY KEY\n);",
                query: "SELECT * FROM NewTable;",
                onDataChange: updateNodeData,
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes, updateNodeData, setNodes]);



    const deleteNode = useCallback(() => {
        setNodes((nds) => {
            const selectedNode = nds.find((node) => node.selected);
            if (!selectedNode) {
                console.warn("No node is selected to delete.");
                return nds;
            }
            return nds.filter((node) => node.id !== selectedNode.id);
        });

        setEdges((eds) => {
            const selectedNode = nodes.find((node) => node.selected);
            if (!selectedNode) return eds;
            return eds.filter(
                (edge) =>
                    edge.source !== selectedNode.id && edge.target !== selectedNode.id
            );
        });
    }, [nodes, setNodes, setEdges]);

    const [copiedNode, setCopiedNode] =
        useState<Node<TableNodeData> | null>(null);

    const copyNode = useCallback(() => {
        const selectedNode = nodes.find((node) => node.selected);
        if (!selectedNode) {
            toast({
                title: "No Node Selected",
                description: "Please select a node to copy.",
                variant: "destructive",
            });
            return;
        }
        // Deep copy the selected node
        const nodeCopy = JSON.parse(JSON.stringify(selectedNode));
        setCopiedNode(nodeCopy);
        toast({
            title: "Node Copied",
            description: `Copied node ${selectedNode.id}.`,
        });
    }, [nodes, toast]);

    // Paste the copied node with a new unique id.
    const pasteNode = useCallback(() => {
        if (!copiedNode) {
            toast({
                title: "No Copied Node",
                description: "Please copy a node before pasting.",
                variant: "destructive",
            });
            return;
        }
        // Generate a new id that does not exist yet.
        let newId = (nodes.length + 1).toString();
        while (nodes.some((node) => node.id === newId)) {
            newId = (parseInt(newId) + 1).toString();
        }
        // Create a new node from the copied one.
        const newNode: Node<TableNodeData> = {
            ...copiedNode,
            id: newId,
            // Offset the position so it does not overlap exactly.
            position: {
                x: copiedNode.position.x + 20,
                y: copiedNode.position.y + 20,
            },
            data: {
                ...copiedNode.data,
                id: newId,
                onDataChange: updateNodeData,
            },
        };
        setNodes((nds) => [...nds, newNode]);
        toast({
            title: "Node Pasted",
            description: `Pasted node as ${newId}.`,
        });
    }, [copiedNode, nodes, setNodes, updateNodeData, toast]);


    const saveFlow = () => {
        if (!rfInstance) {
            toast({
                title: "Error Saving Flow",
                description: "ReactFlow instance is not initialized.",
                variant: "destructive",
            });
            console.error("ReactFlow instance is not initialized.");
            return;
        }
        const flowData = rfInstance.toObject();
        // console.log("Saved Flow:", flowData);
        const blob = new Blob([JSON.stringify(flowData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project}-flow-data.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const loadFlow = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);
                if (!jsonData.nodes || !jsonData.edges) {
                    throw new Error("Invalid JSON structure. Expected { nodes: [], edges: [] }.");
                }
                // console.log("Loaded Flow:", jsonData);
                // Inject onDataChange and ensure data.id is set correctly.
                const loadedNodes = jsonData.nodes.map((node: Node<TableNodeData>) => ({
                    ...node,
                    data: { ...node.data, onDataChange: updateNodeData, id: node.id },
                }));
                // console.log("Loaded Nodes:", loadedNodes);
                setNodes(loadedNodes);
                setEdges(jsonData.edges);
                console.log(jsonData.viewport);
                setViewport(jsonData.viewport);
                toast({
                    title: "Flow Loaded Successfully",
                    description: "The nodes and edges have been updated.",
                });
            } catch (error) {
                toast({
                    title: "Error Loading JSON",
                    description: error instanceof Error ? error.message : "Invalid file format.",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
    };

    return (
        <ReactFlowProvider>
            <div className="w-full h-screen relative m-4 ">
                <ReactFlow
                    zoomOnScroll={false}
                    panOnScroll={false}
                    preventScrolling={false}
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={(instance) => setRfInstance(instance)}
                    fitView
                    className="touch-flow"
                    minZoom={0.1}
                >
                    <Background />
                    <MiniMap />
                    <Controls />
                </ReactFlow>

                <div className="absolute top-4 left-4 z-10 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 bg-white p-2 shadow-lg rounded-lg">
                    <TooltipProvider>
                        {/* Project Name Input */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Input
                                    type="text"
                                    id="project"
                                    value={project}
                                    onChange={(e) => setProject(e.target.value)}
                                    placeholder="Project Name"
                                    className="w-12 h-12 md:w-48"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex items-center">
                                    <p>Project name</p>
                                    <p className="font-mono ml-2">{project}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        {/* Add Node Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={addNode} variant="outline">
                                    <SquarePlusIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Node</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Copy Node Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={copyNode} variant="outline">
                                    <CopyIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy Node</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Paste Node Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={pasteNode} variant="outline">
                                    <ClipboardCopyIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Paste Node</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Delete Node Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={deleteNode} variant="destructive">
                                    <SquareXIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete Node</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Save Flow Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={saveFlow} variant="default">
                                    <SaveIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Save Flow</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Hidden File Input for Upload */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Input
                                    type="file"
                                    accept="application/json"
                                    onChange={loadFlow}
                                    className="hidden"
                                    id="upload-file"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Upload File</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Upload File Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="secondary">
                                    <label htmlFor="upload-file" className="cursor-pointer">
                                        <UploadIcon className="mr-2" />
                                    </label>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Upload File</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>
                <Toaster />
            </div>
        </ReactFlowProvider>
    );
}