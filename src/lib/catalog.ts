// Approved-course catalog: which programs each University / Board is approved to
// offer. Used to restrict the Course dropdown on the student form so, e.g.,
// Mangalayatan only shows the courses it is approved for.
//
// Values must match the students.program enum. Sessions (e.g. "December 2026")
// are managed in the DB table public.academic_sessions per university.

export const ALL_PROGRAMS = [
  "MBA", "BBA", "BCom", "MCom", "BCA", "MCA", "BA", "MA", "PGDM", "PhD",
  "10th", "12th Arts", "12th Commerce", "12th Science",
] as const;

// University -> approved courses
export const UNIVERSITY_COURSES: Record<string, string[]> = {
  "Mangalayatan University": ["MBA", "BBA", "BCom", "MCA", "BCA", "BA", "MA"],
  "Subharti University": ["MBA", "BBA", "BCom", "BA", "MA", "MCA"],
  "Manipal University": ["MBA", "MCA", "BBA", "BCom", "BCA"],
  "Amity University": ["MBA", "BBA", "BCA", "MCA", "BA"],
  "NMIMS": ["MBA", "BBA", "PGDM"],
  "IGNOU": ["MBA", "BBA", "BCom", "BA", "MA"],
  "LPU": ["MBA", "MCA", "BBA", "BCA"],
};

// Board -> allowed courses (school-level equivalency)
export const BOARD_COURSES: Record<string, string[]> = {
  "SBSE (Sikkim Board)": ["10th", "12th Arts", "12th Commerce", "12th Science"],
  "NIOS": ["10th", "12th Arts", "12th Commerce", "12th Science"],
  "NWAC (USA)": ["10th", "12th Arts", "12th Commerce", "12th Science"],
};

// Courses available for a given institution name (university or board). Falls
// back to the full list when the institution isn't in the catalog yet.
export function coursesFor(institution?: string | null): string[] {
  if (!institution) return [...ALL_PROGRAMS];
  return UNIVERSITY_COURSES[institution] || BOARD_COURSES[institution] || [...ALL_PROGRAMS];
}
