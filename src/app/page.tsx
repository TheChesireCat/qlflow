import TableFlowVisualization from '@/components/TableFlowVisualization';
import { ReactFlowProvider } from '@xyflow/react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Table Flow Visualization
        </h1>
        <ReactFlowProvider>
          <TableFlowVisualization/>
        </ReactFlowProvider>
      </div>
    </main>
  );
}

