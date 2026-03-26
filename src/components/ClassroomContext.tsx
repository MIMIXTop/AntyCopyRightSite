import type {Course, CourseWork} from "../types/auth.ts";
import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import {useAuth} from "./AuthContext.tsx";
import {classroomService} from "../services/ClassroomService.ts";


interface ClassroomContextType {
    courses: Course[];
    activeCourseId: string | null ;
    courseWorkMap: Record<string, CourseWork[]>;

    loadingCourse: boolean;
    loadingWork: boolean;

    selectCourse: (id: string) => void;
    fetchCourseWorks: (courseId: string) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

const ClassroomProvider = ({ children }: { children: ReactNode }) => {
    const {isAuthenticated} = useAuth();

    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [courseWorkMap, setCourseWorkMap] = useState<Record<string, CourseWork[]>>({});

    const [loadingWork, setLoadingWork] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setLoadingCourses(true);
            classroomService.getCourses()
                .then(setCourses)
                .finally(() => setLoadingCourses(false));
        }
    }, [isAuthenticated]);

    const selectCourse = (id: string) => {
        setActiveCourseId(id);
        if (!courseWorkMap[id]) {
            fetchCourseWork(id);
        }
    };

    const fetchCourseWork = async (id: string) => {
        setLoadingWork(true);
        try {
            const work = await classroomService.getCourseWorks(id);
            setCourseWorkMap(prev => ({...prev, [id]: work}));
        } catch (error) {
            console.error("Ошибка загрузки заданий:", error);
        } finally {
            setLoadingWork(false);
        }
    };

    return (
        <ClassroomContext.Provider value={{
            courses,
            activeCourseId,
            courseWorkMap,
            loadingWork,
            loadingCourses,
            selectCourse,
            fetchCourseWork
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
