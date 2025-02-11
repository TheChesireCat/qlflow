import TableFlowVisualization from '@/components/TableFlowVisualization';
import { ReactFlowProvider } from '@xyflow/react';

export default function Home() {
  return (
    
    
      <div className="w-full max-full bg-white shadow-lg rounded-lg">
        <ReactFlowProvider>
          <TableFlowVisualization/>
        </ReactFlowProvider>
      </div>

  );
}

