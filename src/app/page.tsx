import TableFlowVisualization from '@/components/TableFlowVisualization';
import { ReactFlowProvider } from '@xyflow/react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-full bg-white shadow-lg rounded-lg">
        <ReactFlowProvider>
          <TableFlowVisualization/>
        </ReactFlowProvider>
      </div>
    </main>
  );
}

