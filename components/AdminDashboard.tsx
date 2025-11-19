import React, { useEffect, useState } from 'react';
import { ExamResult } from '../types';
import { LogOut, Trash2, Database } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const storedResults = localStorage.getItem('exam_db');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        // Sort by most recent
        parsed.sort((a: ExamResult, b: ExamResult) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setResults(parsed);
      } catch (e) {
        console.error("Failed to parse DB", e);
      }
    }
  }, []);

  const clearDatabase = () => {
    if (confirm('¿Estás seguro de que deseas borrar todos los registros? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('exam_db');
      setResults([]);
    }
  };

  const calculateAverage = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
    return (total / results.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Database className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Base de Datos de Resultados</h1>
              <p className="text-sm text-gray-500">Examen de Biomecánica - Panel de Profesor</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total de Alumnos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{results.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Promedio General</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{calculateAverage()}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-start">
             <h3 className="text-gray-500 text-sm font-medium mb-2">Acciones</h3>
            <button 
              onClick={clearDatabase}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              <Trash2 size={16} />
              Borrar Base de Datos
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Nombre del Alumno</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">ID / Matrícula</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Aciertos</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Calificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.length > 0 ? (
                  results.map((result, idx) => {
                    const percentage = (result.score / result.totalQuestions) * 100;
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{result.studentName}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono">{result.studentId}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {result.score} / {result.totalQuestions}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            percentage >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {percentage.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay resultados registrados todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;