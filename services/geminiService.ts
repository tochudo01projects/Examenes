import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, SOURCE_TEXT } from "../types";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: { type: Type.STRING, description: "The question text based on the biomechanics content." },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 possible answers, one correct and three plausible distractors."
          },
          correctAnswer: { type: Type.STRING, description: "The correct answer string, must match one of the options exactly." }
        },
        required: ["id", "text", "options", "correctAnswer"],
      },
    },
  },
  required: ["questions"],
};

export const generateExam = async (): Promise<Question[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Act as a university biomechanics professor. 
      Based strictly on the following text from a study guide, generate a multiple-choice exam with 8 distinct questions.
      
      Text content:
      ${SOURCE_TEXT}

      Instructions:
      1. Create realistic questions that test the student's understanding of the definitions provided.
      2. Provide exactly 4 options for each question.
      3. Ensure one option is correct and matches the definition in the text.
      4. The output must be valid JSON matching the requested schema.
      5. The language must be Spanish.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.3, // Low temperature for factual accuracy
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini");
    }

    const parsed = JSON.parse(jsonText);
    return parsed.questions;

  } catch (error) {
    console.error("Error generating exam:", error);
    // Fallback questions in case of API failure or quota limits
    return [
      {
        id: 1,
        text: "¿Qué son las medidas del estado mecánico del biosistema y de su variación?",
        options: ["Características biomecánicas", "Trayectoria", "Coordenadas", "Ritmo"],
        correctAnswer: "Características biomecánicas"
      },
      {
        id: 2,
        text: "¿Qué técnica emplea la exposición simple y múltiple?",
        options: ["Cinerregistro", "Fotorregistro", "Observación", "Electromiografía"],
        correctAnswer: "Fotorregistro"
      },
      {
        id: 3,
        text: "¿Cuáles son características cinemáticas temporales?",
        options: ["Velocidad y aceleración", "Coordenadas y trayectorias", "Instante y ritmo", "Fuerza y potencia"],
        correctAnswer: "Instante y ritmo"
      }
    ];
  }
};