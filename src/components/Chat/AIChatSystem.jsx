import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, FaTimes, FaComments, FaUser, FaRobot, FaSpinner,
  FaMicrophone, FaPaperclip, FaSmile, FaEllipsisH, FaExpand,
  FaCompress, FaCopy, FaDownload, FaTrash, FaHistory, FaStar
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AIChatSystem = ({ embedded = false, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(embedded ? true : false);
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [chatHistory, setChatHistory] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Más preciso y creativo' },
    { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Rápido y eficiente' },
    { id: 'claude', name: 'Claude', description: 'Análisis detallado' },
    { id: 'legal-ai', name: 'Legal AI', description: 'Especializado en derecho' }
  ];

  const quickResponses = [
    "Necesito consulta legal",
    "¿Cuáles son sus honorarios?",
    "Quiero agendar una cita",
    "Información sobre divorcios",
    "Asesoría en contratos",
    "Defensa penal"
  ];

  const emojis = ['😊', '👍', '❤️', '🎉', '🤔', '👏', '💡', '⚖️', '📚', '✅'];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Cargar historial de chat
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    // Cargar información del usuario
    const savedName = localStorage.getItem('chatUserName');
    const savedEmail = localStorage.getItem('chatUserEmail');
    if (savedName) setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);

    // Mensaje de bienvenida
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: '¡Hola! Soy su asistente legal virtual con IA. ¿En qué puedo ayudarle hoy?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        model: selectedModel
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim() && !attachedFile) return;
    
    // Verificar si necesitamos información del usuario
    if (!userName && !userEmail && messages.length <= 1) {
      setShowUserForm(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      userName: userName || 'Usuario',
      file: attachedFile
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // Simular procesamiento con IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = await generateAIResponse(input);
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        rating: null
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Guardar en historial
      saveToHistory(userMessage, botMessage);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar su mensaje');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    
    // Respuestas contextuales basadas en IA
    const responses = {
      consulta: `Perfecto, puedo ayudarle a agendar una consulta legal. Nuestro equipo especializado puede atenderle en las siguientes áreas:

• **Derecho Penal**: Defensa en casos criminales
• **Derecho Civil**: Contratos, obligaciones, daños
• **Derecho de Tránsito**: Multas, accidentes
• **Derecho Comercial**: Empresas, sociedades
• **Derecho de Familia**: Divorcios, custodia

¿En qué área específica necesita asesoría? También puedo mostrarle los horarios disponibles esta semana.`,

      precio: `Nuestros honorarios se estructuran de la siguiente manera:

📋 **Consulta Inicial**: GRATIS (30 minutos)
💼 **Asesoría Simple**: $50 - $150
⚖️ **Casos Complejos**: Desde $500
📄 **Contratos**: $200 - $800
🏛️ **Representación Legal**: Honorarios por caso

Ofrecemos planes de pago flexibles y trabajamos con su presupuesto. ¿Le gustaría agendar una consulta gratuita para evaluar su caso?`,

      cita: `Excelente decisión. Puedo ayudarle a agendar su cita ahora mismo.

📅 **Horarios Disponibles Esta Semana:**
• Lunes: 14:00, 16:00
• Martes: 10:00, 11:30, 15:00
• Miércoles: 9:00, 14:00, 17:00
• Jueves: 10:30, 13:00, 16:30
• Viernes: 9:00, 11:00, 14:00

También ofrecemos:
🖥️ Consultas virtuales por videollamada
📱 Asesoría vía WhatsApp
🏢 Citas presenciales en oficina

¿Qué modalidad prefiere?`,

      default: `Entiendo su consulta. Como asistente legal con IA, puedo ayudarle con:

🔍 **Análisis Legal**: Evaluación inicial de su caso
📚 **Información Jurídica**: Explicación de leyes y procedimientos
📅 **Agendamiento**: Coordinar citas con nuestros abogados
💡 **Orientación**: Primeros pasos legales recomendados
📄 **Documentación**: Información sobre requisitos

¿Podría proporcionarme más detalles sobre su situación para brindarle una mejor asesoría?`
    };

    // Buscar coincidencias en el input
    if (input.includes('consulta') || input.includes('asesor')) {
      return responses.consulta;
    } else if (input.includes('precio') || input.includes('costo') || input.includes('honorario')) {
      return responses.precio;
    } else if (input.includes('cita') || input.includes('agendar') || input.includes('horario')) {
      return responses.cita;
    } else {
      return responses.default;
    }
  };

  const saveToHistory = (userMsg, botMsg) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      messages: [userMsg, botMsg]
    };
    
    const updatedHistory = [...chatHistory, newEntry].slice(-10); // Mantener últimas 10 conversaciones
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  const handleQuickResponse = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB máximo
        toast.error('El archivo es demasiado grande (máx. 10MB)');
        return;
      }
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });
      toast.success('Archivo adjunto agregado');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Mensaje copiado');
  };

  const downloadChat = () => {
    const chatContent = messages.map(m => 
      `[${new Date(m.timestamp).toLocaleString()}] ${m.sender === 'user' ? 'Usuario' : 'AI'}: ${m.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-legal-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat descargado');
  };

  const clearChat = () => {
    if (confirm('¿Está seguro de borrar toda la conversación?')) {
      setMessages([{
        id: Date.now(),
        text: '¡Hola! Soy su asistente legal virtual con IA. ¿En qué puedo ayudarle hoy?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        model: selectedModel
      }]);
      toast.success('Chat borrado');
    }
  };

  const rateMessage = (messageId, rating) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    toast.success('Gracias por su feedback');
  };

  if (embedded) {
    return <ChatContent />;
  }

  function ChatContent() {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} bg-white rounded-xl shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-4 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaRobot className="text-2xl" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente Legal IA</h3>
                <p className="text-xs text-blue-100">Modelo: {selectedModel}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button
                onClick={downloadChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaDownload />
              </button>
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTrash />
              </button>
              {!embedded && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Model Selector */}
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {aiModels.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                  selectedModel === model.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ height: isFullscreen ? 'calc(100vh - 280px)' : '400px' }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'bg-blue-600 ml-2' : 'bg-purple-600 mr-2'
                  }`}>
                    {message.sender === 'user' ? <FaUser className="text-white text-sm" /> : <FaRobot className="text-white text-sm" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none shadow-md'
                    }`}>
                      {message.file && (
                        <div className="mb-2 p-2 bg-black/10 rounded-lg">
                          <p className="text-xs flex items-center">
                            <FaPaperclip className="mr-1" />
                            {message.file.name}
                          </p>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <div className={`flex items-center mt-1 space-x-2 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.sender === 'bot' && (
                        <>
                          <button
                            onClick={() => copyMessage(message.text)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaCopy size={12} />
                          </button>
                          <button
                            onClick={() => rateMessage(message.id, 'up')}
                            className={`${message.rating === 'up' ? 'text-green-500' : 'text-gray-400'} hover:text-green-500`}
                          >
                            👍
                          </button>
                          <button
                            onClick={() => rateMessage(message.id, 'down')}
                            className={`${message.rating === 'down' ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                          >
                            👎
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-gray-500"
            >
              <FaRobot className="text-purple-600" />
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses */}
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex space-x-2 overflow-x-auto">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => handleQuickResponse(response)}
                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {response}
              </button>
            ))}
          </div>
        </div>

        {/* User Form Modal */}
        <AnimatePresence>
          {showUserForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-xl"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white p-6 rounded-xl w-80"
              >
                <h4 className="font-bold text-lg mb-4">Antes de continuar</h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setShowUserForm(false);
                  handleSendMessage();
                }}>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Su nombre"
                    className="w-full px-3 py-2 border rounded-lg mb-3"
                    required
                  />
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Su email"
                    className="w-full px-3 py-2 border rounded-lg mb-4"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Continuar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 border-t bg-white rounded-b-xl">
          {attachedFile && (
            <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <FaPaperclip className="mr-2" />
                {attachedFile.name}
              </span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttach}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <FaPaperclip />
            </button>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FaSmile />
              </button>
              
              {showEmojis && (
                <div className="absolute bottom-10 left-0 bg-white shadow-lg rounded-lg p-2 flex space-x-1">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="hover:bg-gray-100 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escriba su consulta legal..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Powered by AI • Consultas legales profesionales 24/7
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Button */}
      {!embedded && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !embedded && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 left-6 w-[400px] h-[600px] z-40"
          >
            <ChatContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatSystem;
