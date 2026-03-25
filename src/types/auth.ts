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