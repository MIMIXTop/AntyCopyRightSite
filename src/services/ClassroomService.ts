import type {Course} from "../types/auth.ts";
import {BaseApiService} from "./api.ts";

interface ClassroomResponse {
    courses: Course[];
    nextPageToken?: string;
}

export class ClassroomService extends BaseApiService {
    constructor() {
        super('https://classroom.googleapis.com/v1');
    }

    async getCourses(): Promise<Course[]> {
        try {
            const data = await this.request<ClassroomResponse>('/courses?courseState=ACTIVE');
            return data.courses || [];
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            return [];
        }
    }

    async getCourse(id: string): Promise<Course> {
        return this.request<Course>(`/courses/${id}`);
    }
}

export const classroomService = new ClassroomService();