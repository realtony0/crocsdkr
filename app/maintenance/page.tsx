import { AlertTriangle } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <AlertTriangle className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Site en maintenance
        </h1>
        <p className="text-xl text-gray-400 max-w-md mx-auto">
          Nous effectuons quelques améliorations. Revenez bientôt !
        </p>
      </div>
    </div>
  );
}
