import React, { useState, useEffect } from 'react';
import { Student, Question, AppState, ExamResult } from './types';
import { generateExam } from './services/geminiService';
import { Loader2, CheckCircle2, User, GraduationCap, BrainCircuit, ChevronRight, Send } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  // State
  const [currentState, setCurrentState] = useState<AppState>(AppState.LOGIN);
  const [student, setStudent] = useState<Student>({ id: '', name: '' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [loadingError, setLoadingError] = useState<string>('');

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (student.name.trim() === 'admin' && student.id.trim() === 'admin') {
      setCurrentState(AppState.ADMIN_DASHBOARD);
      return;
    }
    if (student.name && student.id) {
      startExamGeneration();
    }
  };

  const startExamGeneration = async () => {
    setCurrentState(AppState.LOADING_EXAM);
    setLoadingError('');
    try {
      const generatedQuestions = await generateExam();
      setQuestions(generatedQuestions);
      setCurrentState(AppState.TAKING_EXAM);
    } catch (err) {
      setLoadingError('Hubo un error generando el examen. Por favor intenta de nuevo.');
      setCurrentState(AppState.LOGIN);
    }
  };

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const result: ExamResult = {
      studentId: student.id,
      studentName: student.name,
      score,
      totalQuestions: questions.length,
      timestamp: new Date().toISOString(),
      answers
    };

    // Simulate saving to DB (LocalStorage)
    const existingDb = localStorage.getItem('exam_db');
    let db = existingDb ? JSON.parse(existingDb) : [];
    db.push(result);
    localStorage.setItem('exam_db', JSON.stringify(db));

    setExamResult(result);
    setCurrentState(AppState.RESULTS);
  };

  const resetApp = () => {
    setStudent({ id: '', name: '' });
    setAnswers({});
    setCurrentQuestionIndex(0);
    setExamResult(null);
    setCurrentState(AppState.LOGIN);
  };

  // --- Renders ---

  // 1. Login Screen
  if (currentState === AppState.LOGIN) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-xl shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Examen de Biomecánica</h1>
          <p className="text-center text-gray-500 mb-8">Ingresa tus datos para comenzar la evaluación.</p>
          
          {loadingError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {loadingError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={student.name}
                  onChange={(e) => setStudent({ ...student, name: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID / Matrícula</label>
              <div className="relative">
                <BrainCircuit className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="text"
                  placeholder="Ej. A01234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={student.id}
                  onChange={(e) => setStudent({ ...student, id: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98]"
            >
              Comenzar Examen
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">Para acceso de profesor, usa 'admin' en ambos campos.</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin Dashboard
  if (currentState === AppState.ADMIN_DASHBOARD) {
    return <AdminDashboard onLogout={resetApp} />;
  }

  // 3. Loading Screen (Generating with Gemini)
  if (currentState === AppState.LOADING_EXAM) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center animate-pulse max-w-sm text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Generando Examen</h2>
          <p className="text-gray-500 mt-2">La IA está preparando preguntas basadas en la Guía Biomecánica...</p>
        </div>
      </div>
    );
  }

  // 4. Results Screen
  if (currentState === AppState.RESULTS && examResult) {
    const percentage = (examResult.score / examResult.totalQuestions) * 100;
    const isPass = percentage >= 70;

    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div className={`${isPass ? 'bg-green-600' : 'bg-indigo-600'} p-8 text-center`}>
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              {isPass ? <CheckCircle2 className="w-10 h-10 text-white" /> : <GraduationCap className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {isPass ? '¡Felicidades!' : 'Examen Completado'}
            </h1>
            <p className="text-indigo-100">Resultados enviados a la base de datos.</p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
              <div className="text-center w-1/2 border-r border-gray-100">
                <span className="block text-sm text-gray-500 uppercase tracking-wide">Aciertos</span>
                <span className="block text-4xl font-bold text-gray-800 mt-1">{examResult.score}<span className="text-lg text-gray-400 font-normal">/{examResult.totalQuestions}</span></span>
              </div>
              <div className="text-center w-1/2">
                <span className="block text-sm text-gray-500 uppercase tracking-wide">Calificación</span>
                <span className={`block text-4xl font-bold mt-1 ${isPass ? 'text-green-600' : 'text-indigo-600'}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estudiante:</span>
                <span className="font-medium text-gray-900">{student.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID:</span>
                <span className="font-medium text-gray-900">{student.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={resetApp}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Salir / Nuevo Examen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Taking Exam Screen
  if (currentState === AppState.TAKING_EXAM && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const selectedOption = answers[currentQ.id];

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <User className="text-indigo-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{student.name}</h3>
                <p className="text-xs text-gray-500">{student.id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">
                Pregunta <span className="text-indigo-600 font-bold">{currentQuestionIndex + 1}</span> de {questions.length}
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </header>

        {/* Question Area */}
        <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-24 px-4 max-w-3xl mx-auto w-full">
          
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed mb-2">
              {currentQ.text}
            </h2>
            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
              Selección Múltiple
            </span>

            <div className="space-y-3 mt-4">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative group ${
                    selectedOption === option 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedOption === option ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`text-base ${selectedOption === option ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-30">
          <div className="max-w-3xl mx-auto flex justify-end">
            <button
              disabled={!selectedOption}
              onClick={handleNextQuestion}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all transform ${
                !selectedOption 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finalizar Examen' : 'Siguiente'}
              {currentQuestionIndex === questions.length - 1 ? <Send size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return null;
};

export default App;