'use server';

import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'submissions.json');
const logsFilePath = path.join(process.cwd(), 'src', 'data', 'logs.json');

async function readData(filePath: string) {
    try {
        await fs.access(filePath);
    } catch (error) {
        const dirPath = path.dirname(filePath);
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch(e) {
            // ignore
        }
        await fs.writeFile(filePath, JSON.stringify([]));
    }

    const jsonData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(jsonData);
}

async function writeData(filePath: string, data: any) {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf8');
}

export async function saveSubmission(submission: any) {
    const submissions = await readData(dataFilePath);
    const newSubmission = {
        id: new Date().toISOString(),
        ...submission,
    };
    submissions.push(newSubmission);
    await writeData(dataFilePath, submissions);
    return newSubmission;
}

export async function getSubmissions() {
    return await readData(dataFilePath);
}

export async function updateSubmission(updatedEntry: any) {
    const submissions = await readData(dataFilePath);
    const index = submissions.findIndex((s: any) => s.id === updatedEntry.id);
    if (index !== -1) {
        const oldEntry = submissions[index];
        submissions[index] = updatedEntry;
        await writeData(dataFilePath, submissions);
        
        // Log the change
        await saveLog({
            action: 'EDIT',
            timestamp: new Date().toISOString(),
            details: `Updated entry ${updatedEntry.id}. CAT No: ${updatedEntry.catNo}`,
            oldData: oldEntry,
            newData: updatedEntry
        });
    }
}

export async function deleteSubmission(id: string) {
    const submissions = await readData(dataFilePath);
    const entryToDelete = submissions.find((s: any) => s.id === id);
    const filteredSubmissions = submissions.filter((s: any) => s.id !== id);
    await writeData(dataFilePath, filteredSubmissions);
    
    // Log the change
    if (entryToDelete) {
        await saveLog({
            action: 'DELETE',
            timestamp: new Date().toISOString(),
            details: `Deleted entry ${id}. CAT No: ${entryToDelete.catNo}`,
            data: entryToDelete
        });
    }
}

async function saveLog(log: any) {
    const logs = await readData(logsFilePath);
    logs.unshift(log); // Add to beginning for reverse chronological order
    await writeData(logsFilePath, logs);
}

export async function getLogs() {
    return await readData(logsFilePath);
}
