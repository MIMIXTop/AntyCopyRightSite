import type {Course, CourseWork, Student, StudentSubmission} from "../types/auth.ts";
import {BaseApiService} from "./api.ts";
import {env} from "../config/env.ts";

const throwIfUnauthorized = (error: unknown) => {
    if (error instanceof Error && error.message === 'Unauthorized') {
        throw error;
    }
};

export class ClassroomService extends BaseApiService {
    constructor() {
        super(`${env.apiBaseUrl}/api/classroom`);
    }

    async getCourses(): Promise<Course[]> {
        try {
            const data = await this.request<{courses: Course[]}>('/courses?courseStates=ACTIVE');
            return data.courses || [];
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            throwIfUnauthorized(error);
            return [];
        }
    }

    async getCourseWorks(courseId: string): Promise<CourseWork[]> {
        try {
            const encodedCourseId = encodeURIComponent(courseId);
            const data = await this.request<{ courseWork: CourseWork[] }>(`/courses/${encodedCourseId}/courseWork?courseWorkStates=PUBLISHED`);
            return data.courseWork || [];
        } catch (error) {
            console.error('Failed to fetch courseWorks:', error);
            throwIfUnauthorized(error);
            return [];
        }
    }

    async getSubmissions(courseId: string, courseWorkId: string): Promise<StudentSubmission[]> {
        try {
            const encodedCourseId = encodeURIComponent(courseId);
            const encodedCourseWorkId = encodeURIComponent(courseWorkId);
            const data = await this.request<{ studentSubmissions: StudentSubmission[] }>(
                `/courses/${encodedCourseId}/courseWork/${encodedCourseWorkId}/studentSubmissions`
            );
            return data.studentSubmissions || [];
        } catch (error) {
            console.error('Ошибка загрузки работ студентов:', error);
            throwIfUnauthorized(error);
            return [];
        }
    }

    async getCourseStudents(courseId: string): Promise<Student[]> {
        try {
            const encodedCourseId = encodeURIComponent(courseId);
            const data = await this.request<{ students: Student[] }>(`/courses/${encodedCourseId}/students`);
            return data.students || [];
        } catch (error) {
            console.error('Ошибка загрузки студентов курса:', error);
            throwIfUnauthorized(error);
            return [];
        }
    }
}

export const classroomService = new ClassroomService();
