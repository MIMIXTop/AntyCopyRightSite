import type {Course, CourseWork, Student, StudentSubmission} from "../types/auth.ts";
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

    async getSubmissions(courseId: string, courseWorkId: string): Promise<StudentSubmission[]> {
        try {
            const data = await this.request<{ studentSubmissions: StudentSubmission[] }>(
                `/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`
            );
            return data.studentSubmissions || [];
        } catch (error) {
            console.error('Ошибка загрузки работ студентов:', error);
            return [];
        }
    }

    async getCourseStudents(courseId: string): Promise<Student[]> {
        try {
            const data = await this.request<{ students: Student[] }>(`/courses/${courseId}/students`);
            return data.students || [];
        } catch (error) {
            console.error('Ошибка загрузки студентов курса:', error);
            return [];
        }
    }
}

export const classroomService = new ClassroomService();