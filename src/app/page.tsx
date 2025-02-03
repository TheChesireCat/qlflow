import TableFlowVisualization from '@/components/TableFlowVisualization';
import { ReactFlowProvider } from '@xyflow/react';

export default function Home() {
  return (
    <main className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Table Flow Visualization</h1>
      <ReactFlowProvider>
      <TableFlowVisualization />
      </ReactFlowProvider>
    </main>
  );
}

