import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AI_KEY_NOT_SET');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Upgraded to 2.0-flash as it's common now

export const convertNotesToTasks = async (notes) => {
    try {
        const prompt = `Convert the following notes into actionable tasks. Output valid JSON array of objects with keys: title, description, priority (urgent, high, medium, low), status (todo, in_progress, review), dueDate (YYYY-MM-DD or null), subtasks (array of strings). 
    Notes: ${notes}`;
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error('AI Conversion failed');
    }
};

export const rewriteToUserStory = async (taskDescription) => {
    try {
        const prompt = `Rewrite this task description into a proper Scrum User Story format (As a..., I want..., so that...). 
    Task: ${taskDescription}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error('AI Rewrite failed');
    }
};

export const generateKanbanStructure = async (text) => {
    try {
        const prompt = `Create a Kanban board structure (columns with tasks) for: ${text}. Output ONLY valid JSON array of columns. Each column: { id, title, tasks: [{title, description, priority, subtasks}] }`;
        const result = await model.generateContent(prompt);
        let resText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(resText);
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error('AI Kanban generation failed');
    }
};

export const generateWorkspaceInsights = async (workspaceId, projects, tasks) => {
    try {
        const prompt = `Analyze these ${projects.length} projects and ${tasks.length} tasks and provide 3 brief actionable insights for the team. Output as 3 bullet points.`;
        const result = await model.generateContent(prompt);
        return result.response.text().split('\n').filter(l => l.trim()).slice(0, 3);
    } catch (error) {
        console.error("AI Service Error:", error);
        return ["Review upcoming deadlines.", "Optimize task allocation.", "Check project progress."];
    }
};
