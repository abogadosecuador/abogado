import React, { useState, useEffect } from 'react';

const AppLoader = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Inicializando...');
  
  useEffect(() => {
    const steps = [
      { progress: 20, status: 'Cargando dependencias...', time: 500 },
      { progress: 40, status: 'Verificando servicios...', time: 800 },
      { progress: 60, status: 'Cargando componentes...', time: 1000 },
      { progress: 80, status: 'Preparando interfaz...', time: 1200 },
      { progress: 95, status: 'Finalizando...', time: 500 },
      { progress: 100, status: 'Completado', time: 300 }
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgress(step.progress);
        setStatus(step.status);
        currentStep++;
        
        if (currentStep === steps.length) {
          setTimeout(() => {
            if (onLoadComplete) onLoadComplete();
          }, steps[currentStep - 1].time);
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [onLoadComplete]);
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <img 
            src="/icons/favicon.svg" 
            alt="Abogado Wilson" 
            className="w-24 h-24 mx-auto animate-pulse"
            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=AW'}
          />
        </div>
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Abogado Wilson</h1>
        <p className="text-xl text-gray-600 mb-8">{status}</p>
        
        <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700 mx-auto">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">{progress}% completado</p>
      </div>
    </div>
  );
};

export default AppLoader;
