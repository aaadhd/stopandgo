
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using fallback quiz questions.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const schema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "A fun, simple, and kid-friendly trivia question."
    },
    answers: {
      type: Type.ARRAY,
      description: "An array of 3 possible answers. One must be correct.",
      items: { type: Type.STRING }
    },
    correctAnswer: {
      type: Type.STRING,
      description: "The correct answer from the 'answers' array."
    }
  },
  required: ["question", "answers", "correctAnswer"]
};

export async function generateQuizQuestion(): Promise<Quiz> {
  if (!API_KEY) {
    // Fallback for when API key is not available
    const fallbackQuizzes: Quiz[] = [
        { question: "What color is a banana?", answers: ["Red", "Yellow", "Blue"], correctAnswer: "Yellow" },
        { question: "How many wheels are on a bicycle?", answers: ["2", "3", "4"], correctAnswer: "2" },
        { question: "What animal says 'Moo'?", answers: ["Cat", "Dog", "Cow"], correctAnswer: "Cow" },
    ];
    return fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate one easy, kid-friendly trivia question with 3 possible answers.",
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const text = response.text.trim();
    const quizData = JSON.parse(text);

    // Validate that correctAnswer is one of the answers
    if (!quizData.answers.includes(quizData.correctAnswer)) {
        console.error("Validation Error: Correct answer not found in answers list.", quizData);
        // Provide a corrected version or throw an error
        throw new Error("Generated quiz data is invalid.");
    }

    return quizData as Quiz;
  } catch (error) {
    console.error("Error generating quiz question from Gemini API:", error);
    throw new Error("Failed to fetch quiz data.");
  }
}