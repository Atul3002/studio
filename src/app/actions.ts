'use server';

import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'submissions.json');

async function readData() {
    try {
        await fs.access(dataFilePath);
    } catch (error) {
        // If the directory or file doesn't exist, create it with an empty array.
        const dirPath = path.dirname(dataFilePath);
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch(e) {
            // ignore, might exist already
        }
        await fs.writeFile(dataFilePath, JSON.stringify([]));
    }

    const jsonData = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(jsonData);
}

async function writeData(data: any) {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(dataFilePath, jsonData, 'utf8');
}

export async function saveSubmission(submission: any) {
    const submissions = await readData();
    const newSubmission = {
        id: new Date().toISOString(),
        ...submission,
    };
    submissions.push(newSubmission);
    await writeData(submissions);
    return newSubmission;
}

export async function getSubmissions() {
    return await readData();
}
