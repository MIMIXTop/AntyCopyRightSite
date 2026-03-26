export interface GoogleUser {
    name: string;
    picture: string;
    email: string;
    sub: string; // ID пользователя
}

export interface Course {
    id: string;
    name: string;
    ownerId: string;
    courseState: string;
}

export interface CourseWork {
    id: string;
    title: string;
    courseId: string;
    description: string;
}