
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
      description: "An array of 4 possible answers. One must be correct.",
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
        { question: "What color is a banana?", answers: ["Red", "Yellow", "Blue", "Green"], correctAnswer: "Yellow" },
        { question: "How many wheels are on a bicycle?", answers: ["2", "3", "4", "5"], correctAnswer: "2" },
        { question: "What animal says 'Moo'?", answers: ["Cat", "Dog", "Cow", "Bird"], correctAnswer: "Cow" },
        { question: "How many legs does a spider have?", answers: ["6", "8", "10", "12"], correctAnswer: "8" },
        { question: "What do bees make?", answers: ["Honey", "Milk", "Cheese", "Butter"], correctAnswer: "Honey" },
        { question: "What is the color of snow?", answers: ["Black", "White", "Red", "Blue"], correctAnswer: "White" },
        { question: "How many days are in a week?", answers: ["5", "6", "7", "8"], correctAnswer: "7" },
        { question: "What do fish live in?", answers: ["Air", "Water", "Sand", "Trees"], correctAnswer: "Water" },
        { question: "What shape has three sides?", answers: ["Circle", "Square", "Triangle", "Rectangle"], correctAnswer: "Triangle" },
        { question: "What do we use to write?", answers: ["Fork", "Pencil", "Spoon", "Cup"], correctAnswer: "Pencil" }
    ];
    return fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate one easy, kid-friendly trivia question with 4 possible answers.",
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const text = response.text.trim();
    const quizData = JSON.parse(text);

    // Validate that correctAnswer is one of the answers and ensure 4 answers
    if (!quizData.answers.includes(quizData.correctAnswer)) {
        console.error("Validation Error: Correct answer not found in answers list.", quizData);
        throw new Error("Generated quiz data is invalid.");
    }

    if (quizData.answers.length !== 4) {
        console.error("Validation Error: Quiz must have exactly 4 answers.", quizData);
        throw new Error("Generated quiz data is invalid.");
    }

    return quizData as Quiz;
  } catch (error) {
    console.error("Error generating quiz question from Gemini API:", error);
    // Fall back to a random quiz from our pool
    const fallbackQuizzes: Quiz[] = [
        { question: "What color is a banana?", answers: ["Red", "Yellow", "Blue", "Green"], correctAnswer: "Yellow" },
        { question: "How many wheels are on a bicycle?", answers: ["2", "3", "4", "5"], correctAnswer: "2" },
        { question: "What animal says 'Moo'?", answers: ["Cat", "Dog", "Cow", "Bird"], correctAnswer: "Cow" },
        { question: "How many legs does a spider have?", answers: ["6", "8", "10", "12"], correctAnswer: "8" },
        { question: "What do bees make?", answers: ["Honey", "Milk", "Cheese", "Butter"], correctAnswer: "Honey" },
        { question: "What is the color of snow?", answers: ["Black", "White", "Red", "Blue"], correctAnswer: "White" },
        { question: "How many days are in a week?", answers: ["5", "6", "7", "8"], correctAnswer: "7" },
        { question: "What do fish live in?", answers: ["Air", "Water", "Sand", "Trees"], correctAnswer: "Water" },
        { question: "What shape has three sides?", answers: ["Circle", "Square", "Triangle", "Rectangle"], correctAnswer: "Triangle" },
        { question: "What do we use to write?", answers: ["Fork", "Pencil", "Spoon", "Cup"], correctAnswer: "Pencil" }
    ];
    return fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)];
  }
}