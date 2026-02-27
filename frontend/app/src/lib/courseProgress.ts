/**
 * Lightweight localStorage helper for course lesson progress.
 *
 * Storage key: `sm_course_progress`
 * Shape: Record<courseId, Record<lessonId, true>>
 */

const STORAGE_KEY = 'sm_course_progress';

type ProgressMap = Record<string, Record<string, true>>;

function load(): ProgressMap {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function save(map: ProgressMap) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // Storage quota exceeded — silently ignore
    }
}

/** Mark a lesson as completed and persist immediately. */
export function persistLessonComplete(courseId: string, lessonId: string): void {
    const map = load();
    if (!map[courseId]) map[courseId] = {};
    map[courseId][lessonId] = true;
    save(map);
}

/** Check whether a lesson was previously completed. */
export function isLessonDone(courseId: string, lessonId: string): boolean {
    const map = load();
    return !!map[courseId]?.[lessonId];
}

/** Return all completed lesson IDs for a given course. */
export function getCompletedLessons(courseId: string): Set<string> {
    const map = load();
    return new Set(Object.keys(map[courseId] || {}));
}

/** Calculate stored progress percentage for a course given its total lessons. */
export function storedProgress(courseId: string, totalLessons: number): number {
    if (totalLessons === 0) return 0;
    const done = Object.keys(load()[courseId] || {}).length;
    return Math.round((done / totalLessons) * 100);
}
