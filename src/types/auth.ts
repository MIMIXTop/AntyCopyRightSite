export interface GoogleUser {
    name: string;
    picture: string;
    email: string;
    sub: string;
}

export interface Course {
    id: string;
    name: string;
    ownerId: string;
    courseState: string;

    section?: string;
    descriptionHeading?: string;
    alternateLink: string;
    enrollmentCode?: string;
}

export interface CourseWork {
    id: string;
    title: string;
    courseId: string;
    description?: string;


    alternateLink: string;
    creationTime: string;
    updateTime: string;
    state?: string;
    maxPoints?: number;
}

export interface StudentSubmission {
    id: string;
    courseId: string;
    courseWorkId: string;
    userId: string;
    creationTime: string;
    updateTime: string;
    state: string;
    alternateLink: string;
}

export interface UserProfile {
    id: string;
    name: { fullName: string; givenName?: string; familyName?: string };
    photoUrl?: string;
    emailAddress?: string;
}

export interface Student {
    courseId: string;
    userId: string;
    profile: UserProfile;
}