import type {Course, CourseWork} from "../types/auth.ts";
import {BaseApiService} from "./api.ts";

export class ClassroomService extends BaseApiService {
    constructor() {
        super('https://classroom.googleapis.com/v1');
    }

    async getCourses(): Promise<Course[]> {
        try {
            const data = await this.request<{courses: Course[]}>('/courses?courseStates=ACTIVE');
            return data.courses || [];
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            return [];
        }
    }

    async getCourseWorks(courseId: string): Promise<CourseWork[]> {
        try {
            const data = await this.request<{ courseWork: CourseWork[] }>('/courses/' + courseId + '/courseWork?courseWorkStates=PUBLISHED');
            return data.courseWork || [];
        } catch (error) {
            console.error('Failed to fetch courseWorks:', error);
        }
    }
}

export const classroomService = new ClassroomService();