import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaLightbulb, FaTrophy, FaCoins } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const TriviaGame = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/gamification/daily-question', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        setQuestion(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDailyQuestion();
    }
  }, [user]);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      toast.error('Por favor, selecciona una respuesta.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/gamification/submit-answer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ question_id: question.id, answer: selectedAnswer }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setResult(data.data);
      if (data.data.correct) {
        toast.success(`¡Correcto! Has ganado ${data.data.tokensAwarded} tokens.`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando la trivia de hoy...</div>;
  }

  if (error) {
    return (
      <div className="bg-yellow-100 text-yellow-800 rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold">Trivia Diaria</h2>
        <p className="mt-4">{error}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Trivia Legal del Día</h1>
        
        {!result ? (
          <div>
            <div className="bg-brand/10 p-6 rounded-lg mb-6">
              <p className="text-lg font-semibold text-brand-dark">{question.question}</p>
            </div>
            <div className="space-y-4">
              {Object.entries(question.options).map(([key, value]) => (
                <button 
                  key={key}
                  onClick={() => setSelectedAnswer(key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === key ? 'bg-accent text-white border-accent-dark' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
                  <span className="font-bold mr-2">{key.toUpperCase()})</span>{value}
                </button>
              ))}
            </div>
            <button 
              onClick={handleSubmitAnswer}
              className="w-full mt-8 py-3 bg-brand text-white rounded-lg font-bold">
              Enviar Respuesta
            </button>
          </div>
        ) : (
          <div className="text-center">
            {result.correct ? (
              <FaTrophy className="text-7xl text-yellow-400 mx-auto mb-4" />
            ) : (
              <FaLightbulb className="text-7xl text-red-400 mx-auto mb-4" />
            )}
            <h2 className={`text-3xl font-bold ${result.correct ? 'text-success' : 'text-danger'}`}>
              {result.correct ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
            </h2>
            {result.correct && (
              <p className="text-lg text-gray-600 mt-2">¡Has ganado <FaCoins className="inline text-yellow-500" /> {result.tokensAwarded} tokens!</p>
            )}
            <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold">Explicación:</h3>
              <p className="text-gray-700 mt-2">{result.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TriviaGame;
