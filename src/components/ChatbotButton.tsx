import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const ChatbotButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const windowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir chat"
        className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <MotionDiv
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 left-6 w-[20rem] max-w-[85vw] h-auto max-h-[75vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden z-40 origin-bottom-left"
          >
            <header className="bg-blue-600 text-white p-4 font-semibold flex justify-between items-center flex-shrink-0">
              <span>Asistente Legal IA</span>
              <button onClick={() => setOpen(false)} aria-label="Cerrar chat" className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
            </header>
            <main className="flex-1 p-4 text-gray-700 dark:text-gray-200 overflow-auto">
              <p className="font-semibold">👋 Hola, soy tu asistente legal inteligente. ¿Necesitas ayuda?</p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Servicios legales disponibles</li>
                <li>Agendar una cita</li>
                <li>Consultas legales</li>
                <li>Información sobre cursos</li>
              </ul>
               <p className="text-sm mt-2">Si mencionas "ayuda urgente" o "hablar con alguien", te conectaré directamente a nuestro WhatsApp.</p>
            </main>
            <footer className="p-3 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none dark:bg-gray-700"
              />
            </footer>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotButton;