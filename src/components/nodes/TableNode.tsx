"use client";

import React, { memo, useCallback, useState } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism.css";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
// Import shadcn sheet components (adjust the import path as needed)
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"; 
import "./touch.css";

// This type defines the custom data for your TableNode.
// (Added an optional "description" field to display extra details in the sheet.)
export type TableNodeData = {
  id: string;
  tableAlias: string;
  dataset: string;
  schema: string;
  tableName: string;
  createStatement: string;
  query: string;
  description?: string;
  notebook?: string;
  color?: string;
  // Callback passed from the parent for bidirectional updates.
  onDataChange?: (nodeId: string, newData: Partial<TableNodeData>) => void;
};

const colorOptions: string[] = [
  "red",
  "yellow",
  "sky",
  "blue",
  "lime",
  "pink",
  "purple",
  "rose",
  "emerald",
  "teal",
  "cyan",
  "slate",
];

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  sky: "bg-sky-500",
  blue: "bg-blue-500",
  lime: "bg-lime-500",
  pink: "bg-pink-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  slate: "bg-slate-500"
};

const borderColorMap: Record<string, string> = {
  red: "border-red-500",
  yellow: "border-yellow-700",
  sky: "border-sky-500",
  blue: "border-blue-500",
  lime: "border-lime-700",
  pink: "border-pink-500",
  purple: "border-purple-500",
  rose: "border-rose-500",
  emerald: "border-emerald-500",
  teal: "border-teal-500",
  cyan: "border-cyan-500",
  slate: "border-slate-500"
};

const textColorMap: Record<string, string> = {
  red: "text-red-500",
  yellow: "text-yellow-700",
  sky: "text-sky-500",
  blue: "text-blue-500",
  lime: "text-lime-700",
  pink: "text-pink-500",
  purple: "text-purple-500",
  rose: "text-rose-500",
  emerald: "text-emerald-500",
  teal: "text-teal-500",
  cyan: "text-cyan-500",
  slate: "text-slate-500"
};


// Export the full node type for your table node.
export type TableNode = Node<TableNodeData, "table">;

// The component receives full node props typed with our custom TableNode type.
const TableNodeComponent = function TableNode({
  data,
  selected,
}: NodeProps<TableNode>) {
  // Local state to control whether the sheet is open.
  const [sheetOpen, setSheetOpen] = useState(false);

  const colorClass = data.color ? colorMap[data.color] || "bg-gray-500" : "bg-gray-500";
  const borderColorClass = data.color ? borderColorMap[data.color] || "border-gray-500" : "border-gray-500";
  const textColorClass = data.color ? textColorMap[data.color] || "text-blue-500" : "text-blue-500";

  // Create a callback to update a field via the parent's onDataChange.
  const onChange = useCallback(
    (field: keyof TableNodeData, value: string) => {
      if (data.onDataChange) {
        data.onDataChange(data.id, { [field]: value });
      }
    },
    [data]
  );

  // Update multiple fields for the "Full Table Name" input.
  const onFullNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const parts = value.split(".");
      if (parts.length === 3) {
        onChange("dataset", parts[0]);
        onChange("schema", parts[1]);
        onChange("tableName", parts[2]);
      }
    },
    [onChange]
  );

  return (
    <div
      className={`p-5 rounded-lg border max-h-md max-w-md bg-white
         ${
        selected ? "border-4 border-dashed " + borderColorClass : "border-4 " + borderColorClass
      }`}
    >
      {/* Edge connection handles */}
      <Handle type="target" position={Position.Left} />
      
      <div className="flex items-center justify-between mb-2">
        <input
          value={data.tableAlias}
          onChange={(e) => onChange("tableAlias", e.target.value)}
          className={`text-lg font-bold ${textColorClass} w-full border-b border-blue-200 focus:outline-none focus:border-blue-500`}
          placeholder="Table Alias/Nickname"
        />
        {/* Eye button to trigger the sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="ml-2 p-1 rounded hover:bg-gray-200"
              title="View full query & description"
            >
              <Eye size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Node Details</SheetTitle>
              <SheetDescription className="break-all">
                Full Name : {data.dataset}.{data.schema}.{data.tableName}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Query</h4>
                <pre className="p-2 border rounded bg-gray-100 text-xs overflow-auto max-h-screen">
  {data.query}
</pre>
              </div>
              {data.description && (
                <div>
                  <h4 className="text-sm font-semibold">Description</h4>
                  <p className="text-xs">{data.description}</p>
                </div>
              )}
            </div>
            <SheetClose asChild>
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setSheetOpen(false)}
              >
                Close
              </button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
      
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
            value={data.dataset}
            onChange={(e) => onChange("dataset", e.target.value)}
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
            value={data.schema}
            onChange={(e) => onChange("schema", e.target.value)}
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
            value={data.tableName}
            onChange={(e) => onChange("tableName", e.target.value)}
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
          value={`${data.dataset}.${data.schema}.${data.tableName}`}
          onChange={onFullNameChange}
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
            value={data.createStatement}
            onValueChange={(value) => onChange("createStatement", value)}
            highlight={(code) => highlight(code, languages.sql, "sql")}
            padding={10}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: "0.75rem",
              lineHeight: "1.5",
              borderRadius: "0.25rem",
              backgroundColor: "#f9fafb",
              outline: "none",
            }}
          />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-1 text-gray-700">Query:</h3>
        {/* Query container with fixed height and overflow scroll */}
        {/* <div
          className="relative border border-gray-200 rounded-md bg-gray-50"
          style={{ height: "150px", overflow: "scroll" }}
          
        > */}
          <Editor
            value={data.query}
            onScroll={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
            onValueChange={(value) => onChange("query", value)}
            highlight={(code) => highlight(code, languages.sql, "sql")}
            padding={10}
            style={{
              height: "150px",
              overflow: "scroll",
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: "0.75rem",
              lineHeight: "1.5",
              borderRadius: "0.25rem",
              backgroundColor: "#f9fafb",
              outline: "none",
            }}
          />
        {/* </div> */}
      </div>
      <div>
        <h3 className="text-sm font-semibold mt-2 mb-1 text-gray-700">Notebook:</h3>
        <div className="flex items-center space-x-2">
          <Input
            value={data.notebook || ""}
            onChange={(e) => onChange("notebook", e.target.value)}
            className="font-mono text-xs"
            placeholder="Notebook Path"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(TableNodeComponent);