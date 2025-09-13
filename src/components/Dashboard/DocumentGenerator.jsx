import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileContract, FaMagic, FaCoins, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const documentTemplates = [
  { 
    id: 'contrato-arrendamiento',
    name: 'Contrato de Arrendamiento',
    description: 'Genera un contrato de alquiler de vivienda estándar.',
    tokenCost: 5,
    fields: [
      { name: 'arrendador', label: 'Nombre del Arrendador', type: 'text' },
      { name: 'arrendatario', label: 'Nombre del Arrendatario', type: 'text' },
      { name: 'direccion_inmueble', label: 'Dirección del Inmueble', type: 'text' },
      { name: 'canon_mensual', label: 'Canon Mensual (USD)', type: 'number' },
      { name: 'plazo_meses', label: 'Plazo del Contrato (meses)', type: 'number' },
    ]
  },
  { 
    id: 'certificado-laboral',
    name: 'Certificado Laboral',
    description: 'Crea un certificado de trabajo para un empleado.',
    tokenCost: 2,
    fields: [
      { name: 'nombre_empleado', label: 'Nombre del Empleado', type: 'text' },
      { name: 'cargo_empleado', label: 'Cargo del Empleado', type: 'text' },
      { name: 'fecha_inicio', label: 'Fecha de Inicio de Labores', type: 'date' },
      { name: 'salario', label: 'Salario (USD)', type: 'number' },
    ]
  },
];

const DocumentGenerator = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(documentTemplates[0]);
  const [formData, setFormData] = useState({});
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const userTokens = 50; // Placeholder - a obtener del estado del usuario

  const handleTemplateChange = (e) => {
    const template = documentTemplates.find(t => t.id === e.target.value);
    setSelectedTemplate(template);
    setFormData({});
    setGeneratedDocument('');
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (userTokens < selectedTemplate.tokenCost) {
      toast.error('No tienes suficientes tokens para generar este documento.');
      return;
    }

    setIsGenerating(true);
    setGeneratedDocument('');

    try {
      // Simulación de llamada a la API de Gemini
      // En la implementación real, esto llamaría a nuestro backend seguro
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedContent = `DOCUMENTO GENERADO:\nTipo: ${selectedTemplate.name}\nDatos: ${JSON.stringify(formData, null, 2)}`;
      setGeneratedDocument(generatedContent);
      toast.success('¡Documento generado con éxito!');
    } catch (error) {
      toast.error('Error al generar el documento.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Generador de Documentos IA</h1>
          <p className="text-gray-500 mt-1">Crea documentos legales personalizados al instante.</p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center font-bold">
          <FaCoins className="mr-2" />
          <span>{userTokens} Tokens Disponibles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Formulario */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleGenerate}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Selecciona una plantilla</label>
              <select onChange={handleTemplateChange} className="w-full p-3 border rounded-lg bg-gray-50">
                {documentTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">{selectedTemplate.description}</p>
            </div>

            <div className="space-y-4 mb-6">
              {selectedTemplate.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <input 
                    type={field.type} 
                    name={field.name} 
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={isGenerating || userTokens < selectedTemplate.tokenCost}
              className="w-full py-3 bg-brand text-white rounded-lg font-bold flex items-center justify-center disabled:bg-gray-400"
            >
              <FaMagic className="mr-2" />
              {isGenerating ? 'Generando...' : `Generar Documento (${selectedTemplate.tokenCost} Tokens)`}
            </button>
          </form>
        </div>

        {/* Columna de Resultado */}
        <div className="bg-gray-800 text-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Resultado</h3>
          <div className="bg-black bg-opacity-25 rounded-lg p-4 h-96 font-mono text-sm overflow-y-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">Generando...</div>
            ) : generatedDocument ? (
              <pre>{generatedDocument}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">El documento generado aparecerá aquí.</div>
            )}
          </div>
          {generatedDocument && (
            <button className="w-full mt-4 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center">
              <FaDownload className="mr-2" /> Descargar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentGenerator;
