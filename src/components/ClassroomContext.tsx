import type {Course, CourseWork, Student, StudentSubmission} from "../types/auth.ts";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useAuth} from "./AuthContext.tsx";
import {classroomService} from "../services/ClassroomService.ts";


interface ClassroomContextType {
    courses: Course[];
    activeCourseId: string | null ;
    activeCourseWorkId: string | null;
    courseWorkMap: Record<string, CourseWork[]>;
    submissionsMap: Record<string, StudentSubmission[]>;
    studentsMap: Record<string, Student[]>;

    loadingCourse: boolean;
    loadingWork: boolean;
    loadingSubmissions: boolean;

    selectCourse: (id: string) => void;
    selectCourseWork: (id: string | null) => void;
    fetchCourseWorks: (courseId: string) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

const ClassroomProvider = ({ children }: { children: ReactNode }) => {
    const {isAuthenticated} = useAuth();

    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [courseWorkMap, setCourseWorkMap] = useState<Record<string, CourseWork[]>>({});
    const [studentsMap, setStudentsMap] = useState<Record<string, Student[]>>({});

    const [activeCourseWorkId, setActiveCourseWorkId] = useState<string | null>(null);
    const [submissionsMap, setSubmissionsMap] = useState<Record<string, StudentSubmission[]>>({});

    const [loadingWork, setLoadingWork] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setLoadingCourses(true);
            classroomService.getCourses()
                .then(setCourses)
                .finally(() => setLoadingCourses(false));
        }
    }, [isAuthenticated]);

    const fetchCourseWork = useCallback(async (id: string) => {
        if (courseWorkMap[id]) return;
        setLoadingWork(true);
        try {
            const work = await classroomService.getCourseWorks(id); // Убедитесь что метод в сервисе назван так же
            setCourseWorkMap(prev => ({ ...prev, [id]: work }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingWork(false);
        }
    }, [courseWorkMap]);

    const selectCourse = (id: string) => {
        setActiveCourseId(id);
        setActiveCourseWorkId(null);
        if (id !== 'dashboard' && id !== 'profile') {
            if (!courseWorkMap[id]) fetchCourseWork(id);
            if (!studentsMap[id]) fetchCourseStudents(id);
        }
    };

    const selectCourseWork = async (courseWorkId: string | null) => {
        setActiveCourseWorkId(courseWorkId);

        if (courseWorkId && activeCourseId && !submissionsMap[courseWorkId]) {
            setLoadingSubmissions(true);
            try {
                const subs = await classroomService.getSubmissions(activeCourseId, courseWorkId);
                setSubmissionsMap(prev => ({ ...prev, [courseWorkId]: subs }));
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingSubmissions(false);
            }
        }
    };

    const fetchCourseStudents = useCallback(async (courseId: string) => {
        if (studentsMap[courseId]) return; // Если уже загружали — пропускаем
        try {
            const students = await classroomService.getCourseStudents(courseId);
            setStudentsMap(prev => ({ ...prev, [courseId]: students }));
        } catch (error) {
            console.error(error);
        }
    }, [studentsMap]);

    return (
        <ClassroomContext.Provider value={{
            courses,
            activeCourseId,
            courseWorkMap,
            loadingWork,
            loadingCourses,
            selectCourse,
            fetchCourseWork,
            selectCourseWork,
            activeCourseWorkId,
            submissionsMap,
            loadingSubmissions,
            fetchCourseStudents,
            studentsMap
        }}>
            {children}
        </ClassroomContext.Provider>
    )
};
export default ClassroomProvider

export const useClassroom = () => {
    const context = useContext(ClassroomContext);
    if (!context) throw new Error("useClassroo must be used within ClassroomProvider");
    return context;
};
