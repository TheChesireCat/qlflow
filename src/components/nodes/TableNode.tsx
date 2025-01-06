"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism.css";
import { Input } from "@/components/ui/input";
import { NodeProps, Node } from "@xyflow/react";
import "./touch.css";

// export type TableNode = Node<{
//     data: {
//         id: string;
//         tableAlias: string;
//         dataset: string;
//         schema: string;
//         tableName: string;
//         createStatement: string;
//         query: string;
//     };
//     selected: boolean;
// }, 'table'>;

export type TableNodeData = {
    id: string;
    tableAlias: string;
    dataset: string;
    schema: string;
    tableName: string;
    createStatement: string;
    query: string;
  };

  export type TableNode = Node<TableNodeData, 'table'>;

// interface TableNodeProps {
//     data: {
//         id: string;
//         tableAlias: string;
//         dataset: string;
//         schema: string;
//         tableName: string;
//         createStatement: string;
//         query: string;
//     };
//     selected: boolean;
// }

export function TableNode({ data, selected }: NodeProps<TableNode>) {
    const [tableAlias, setTableAlias] = useState(data.tableAlias);
    const [dataset, setDataset] = useState(data.dataset);
    const [schema, setSchema] = useState(data.schema);
    const [tableName, setTableName] = useState(data.tableName);
    const [fullName, setFullName] = useState(
        `${data.dataset}.${data.schema}.${data.tableName}`
    );
    const [createStatement, setCreateStatement] = useState(data.createStatement);
    const [query, setQuery] = useState(data.query);

    const handleChange = useCallback(
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setter(e.target.value);
            },
        []
    );

    const handleFullNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFullName(value);
            const parts = value.split(".");
            if (parts.length === 3) {
                setDataset(parts[0]);
                setSchema(parts[1]);
                setTableName(parts[2]);
            }
        },
        []
    );


    useEffect(() => {
        setFullName(`${dataset}.${schema}.${tableName}`);
    }, [dataset, schema, tableName]);

    return (
        <div
            className={`p-4 rounded-lg border max-w-md bg-white ${selected ? "border-2 border-blue-500" : "border-gray-500"
                }`}
        >
            <Handle
                type="target"
                position={Position.Left}
             
            />
            <input
                value={tableAlias}
                onChange={handleChange(setTableAlias)}
                className="text-lg font-bold mb-2 text-blue-600 w-full border-b border-blue-200 focus:outline-none focus:border-blue-500"
                placeholder="Table Alias/Nickname"
            />
            <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                    <label
                        htmlFor={`dataset-${data.id}`}
                        className="block text-xs font-medium text-gray-700 mb-1"
                    >
                        Dataset
                    </label>
                    <Input
                        id={`dataset-${data.id}`}
                        value={dataset}
                        onChange={handleChange(setDataset)}
                        className="font-mono text-xs"
                        placeholder="Dataset"
                    />
                </div>
                <div>
                    <label
                        htmlFor={`schema-${data.id}`}
                        className="block text-xs font-medium text-gray-700 mb-1"
                    >
                        Schema
                    </label>
                    <Input
                        id={`schema-${data.id}`}
                        value={schema}
                        onChange={handleChange(setSchema)}
                        className="font-mono text-xs"
                        placeholder="Schema"
                    />
                </div>
                <div>
                    <label
                        htmlFor={`tableName-${data.id}`}
                        className="block text-xs font-medium text-gray-700 mb-1"
                    >
                        Table Name
                    </label>
                    <Input
                        id={`tableName-${data.id}`}
                        value={tableName}
                        onChange={handleChange(setTableName)}
                        className="font-mono text-xs"
                        placeholder="Table Name"
                    />
                </div>
            </div>
            <label
                htmlFor={`fullName-${data.id}`}
                className="block text-xs font-medium text-gray-700 mb-1"
            >
                Full Table Name
            </label>
            <div className="mb-2">
                <Input
                    id={`fullName-${data.id}`}
                    value={fullName}
                    onChange={handleFullNameChange}
                    className="font-mono text-xs"
                    placeholder="dataset.schema.table_name"
                />
            </div>
            <div className="mb-2">
                <h3 className="text-sm font-semibold mb-1 text-gray-700">
                    Create Statement:
                </h3>
                <div className="relative border border-gray-200 rounded-md bg-gray-50">
                    <Editor
                        value={createStatement}
                        onValueChange={setCreateStatement}
                        highlight={(code) => highlight(code, languages.sql, "sql")}
                        padding={10}
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: "0.75rem",
                            lineHeight: "1.5",
                            borderRadius: "0.25rem",
                            backgroundColor: "#f9fafb", // Tailwind's `bg-gray-50`
                            outline: "none",
                        }}
                    />
                </div>
            </div>
            <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Query:</h3>
                <div className="relative border border-gray-200 rounded-md bg-gray-50">
                    <Editor
                        value={query}
                        onValueChange={setQuery}
                        highlight={(code) => highlight(code, languages.sql, "sql")}
                        padding={10}
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: "0.75rem",
                            lineHeight: "1.5",
                            borderRadius: "0.25rem",
                            backgroundColor: "#f9fafb", // Tailwind's `bg-gray-50`
                            outline: "none",
                        }}
                    />
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );

}
