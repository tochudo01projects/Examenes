export interface Student {
  id: string;
  name: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface ExamResult {
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  answers: Record<number, string>; // questionId -> selectedOption
}

export enum AppState {
  LOGIN = 'LOGIN',
  LOADING_EXAM = 'LOADING_EXAM',
  TAKING_EXAM = 'TAKING_EXAM',
  RESULTS = 'RESULTS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
}

export const SOURCE_TEXT = `
Son la medida del estado mecánico del biosistema y de su variación. -> características biomecánicas
Es la característica espacial del movimiento -> Trayectoria
Son la medida espacial de la situación del punto respecto a un sistema de referencia -> Coordenadas
La filmación, acelerometría y electromiografía son ejemplo de: -> Medición
Son características cinemáticas de espacio-tiempo -> Velocidad, aceleración (del punto y del cuerpo)
Se emplea la exposición simple y multiple -> Fotorregistro
Son características cinemáticas espaciales -> coordenadas, trayectorias, desplazamiento
Son características cinemáticas temporales -> Instante, ritmo (del movimiento)
Se realiza mediante la exposición, en tramos sucesivos, de la película que se desplaza (cuadro cinematográfico) -> Cinerregistro
Se centra en la evaluación cualitativa de aspectos de interés. -> Observación
`;