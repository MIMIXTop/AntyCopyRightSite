export interface GoogleUser {
    id: string;
    googleSub: string;
    name: string;
    picture: string;
    email: string;
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
    assignmentSubmission?: AssignmentSubmission;
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

export interface DriveFile {
    id: string;
    title: string;
    alternateLink: string;
    thumbnailUrl?: string;
}

export interface Attachment {
    driveFile?: DriveFile;
}

export interface AssignmentSubmission {
    attachments?: Attachment[];
}

export interface Submission {
    id: string;
    courseId: string;
    courseWorkId: string;
    userId: string;
    creationTime: string;
    updateTime: string;
    state: string;
    alternateLink: string;
    assignmentSubmission?: AssignmentSubmission;
}

export interface FileMeta {
    studentName: string;
    fileName: string;
}

export interface SimilarityItem {
    id: string;
    similarity: Array<{ id: string; value: number }>;
}

export interface AnalyzeSectionRef {
    label: string;
    document_id: string;
    doc_index: number;
    section_index: number;
    title: string;
    normalized_title: string;
}

export interface AnalyzeComparison {
    distance: number;
    similarity: number;
    best_left_sentence: number;
    best_right_sentence: number;
    best_similarity: number;
}

export interface AnalyzePairSection {
    left: AnalyzeSectionRef;
    right: AnalyzeSectionRef;
    comparison: AnalyzeComparison;
}

export interface AnalyzeDocumentInventoryItem {
    doc_index: number;
    document_id: string;
    fragment_count: number;
}

export interface AnalyzeSectionInventoryItem {
    title: string;
    documents: number;
    sentence_count: number;
    source_titles: string[];
}

export interface AnalyzeSkippedSection {
    title: string;
    label: string;
    document_id: string;
}

export interface AnalyzeSectionSummary {
    title: string;
    source_titles: string[];
    fragment_count: number;
    pair_count: number;
    total_sentence_pairs: number;
    similarity: number;
    distance: number;
    description: string;
    best_pair?: AnalyzePairSection;
    worst_pair?: AnalyzePairSection;
}

export interface AnalyzeDocumentPairSummary {
    left_doc_index: number;
    right_doc_index: number;
    left_document_id: string;
    right_document_id: string;
    section_count: number;
    total_sentence_pairs: number;
    similarity: number;
    distance: number;
    best_section?: AnalyzePairSection;
    worst_section?: AnalyzePairSection;
    sections: AnalyzePairSection[];
}

export interface AnalyzeResponse {
    documents: number;
    source_documents: number;
    fragments: number;
    sections: number;
    comparable_sections: number;
    top_k_candidates: number;
    document_limit: number;
    worker_count: number;
    document_inventory: AnalyzeDocumentInventoryItem[];
    section_inventory: AnalyzeSectionInventoryItem[];
    skipped_sections: AnalyzeSkippedSection[];
    section_summaries: AnalyzeSectionSummary[];
    document_pair_summaries: AnalyzeDocumentPairSummary[];
}
