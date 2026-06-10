/* Shared directory data: partner universities and school boards.
   Used by /universities, /boards and the QuickJump dropdowns. */

export type University = {
  id: string;
  name: string;
  city: string;
  description: string;
  courses: string[];
  affiliation: string;
  ranking: string;
  highlight: string;
};

export const universities: University[] = [
  {
    id: "jain",
    name: "Jain (Deemed-to-be) University",
    city: "Bengaluru",
    description:
      "Jain University is a hub for learning in every sense of the word. A regular recipient of NAAC A++ accreditation, it offers a world-class environment for online management and computer application studies.",
    courses: ["Online MBA", "Online MCA", "Online BBA", "Online B.Com"],
    affiliation: "UGC-DEB, AICTE Approved",
    ranking: "#68 NIRF Ranking",
    highlight: "Industry-aligned specializations and top-tier placement support.",
  },
  {
    id: "manipal",
    name: "Manipal University",
    city: "Manipal",
    description:
      "Manipal Academy of Higher Education (MAHE) is an Institution of Eminence. Their online vertical brings the same academic rigour and prestige to your home screen.",
    courses: ["Online MBA", "Online MCA", "Online BBA", "Online B.Com", "Online BCA"],
    affiliation: "UGC-DEB Approved",
    ranking: "A++ Grade by NAAC",
    highlight: "Access to a global alumni network of over 300,000 professionals.",
  },
  {
    id: "amity",
    name: "Amity University",
    city: "Noida",
    description:
      "Amity University Online is devoted to creating a transformative learning environment. With a presence in London, Dubai, and Singapore, they offer a truly global perspective.",
    courses: ["Online MBA", "Online BBA", "Online BCA", "Online MCA", "Online BA"],
    affiliation: "UGC-DEB, WASC (USA) Accredited",
    ranking: "Top 3% Globally",
    highlight: "Live interactive sessions with global faculty.",
  },
  {
    id: "nmims",
    name: "NMIMS",
    city: "Mumbai",
    description:
      "Narsee Monjee Institute of Management Studies is India's premier destination for management education. Their distance programs are powered by the same legendary faculty.",
    courses: ["Online MBA", "Post Graduate Diploma", "Online BBA"],
    affiliation: "UGC-DEB Approved",
    ranking: "Category 1 Autonomy",
    highlight: "Career services that have served over 12,000 learners.",
  },
  {
    id: "sikkim-board",
    name: "Sikkim Board (SBSE)",
    city: "Gangtok",
    description:
      "The Sikkim Board of Secondary Education (SBSE) provides a recognized and flexible path for students to complete their Class 10 and 12 certifications. It is an ideal board for those returning to education after a gap.",
    courses: ["Secondary (10th)", "Senior Secondary (12th)"],
    affiliation: "State Government of Sikkim",
    ranking: "Government Recognised",
    highlight: "Simplified examination patterns and widespread validity for higher studies.",
  },
  {
    id: "lpu",
    name: "LPU (Lovely Professional University)",
    city: "Phagwara",
    description:
      "LPU Online is known for its technological edge. They offer one of the most sophisticated Learning Management Systems (LMS) in the country, ensuring a seamless student experience.",
    courses: ["Online MBA", "Online MCA", "Online BBA", "Online BCA"],
    affiliation: "UGC-DEB, NAAC A++",
    ranking: "Top Private University",
    highlight: "Innovative pedagogy and weekend live masterclasses.",
  },
];

export type Board = {
  id: string;
  name: string;
  level: "10th" | "12th";
  body: string;
  description: string;
  eligibility: string;
  subjects: string[];
  highlight: string;
};

export const boards: Board[] = [
  {
    id: "sbse-10",
    name: "Sikkim Board (SBSE) — Secondary",
    level: "10th",
    body: "Sikkim Board of Secondary Education · Gangtok",
    description:
      "The SBSE Secondary certificate is a government-recognized Class 10 qualification, designed for learners who left school early and now need a valid matriculation credential to move forward.",
    eligibility: "Previous grade marks card · No upper age limit",
    subjects: ["English", "Mathematics", "Science", "Social Science", "Regional Language"],
    highlight: "Simplified examination pattern with flexible study schedules.",
  },
  {
    id: "sbse-12",
    name: "Sikkim Board (SBSE) — Senior Secondary",
    level: "12th",
    body: "Sikkim Board of Secondary Education · Gangtok",
    description:
      "The SBSE Senior Secondary certificate is a recognized Class 12 qualification that opens the door to undergraduate study, including the online degree programs listed in our university directory.",
    eligibility: "Class 10 marks card from any recognized board",
    subjects: ["English", "Accountancy", "Business Studies", "Economics", "Political Science"],
    highlight: "Direct pathway into UGC-DEB approved online degrees.",
  },
  {
    id: "nios-10",
    name: "NIOS — Secondary",
    level: "10th",
    body: "National Institute of Open Schooling · NOIDA",
    description:
      "NIOS is the world's largest open schooling system, run by the Government of India. Its Secondary course offers Class 10 certification with on-demand examinations and full subject flexibility.",
    eligibility: "Age 14+ · Self-certification of Class 8 level study",
    subjects: ["English", "Mathematics", "Science & Technology", "Social Science", "Data Entry Operations"],
    highlight: "On-demand exams — appear when you are ready.",
  },
  {
    id: "nios-12",
    name: "NIOS — Senior Secondary",
    level: "12th",
    body: "National Institute of Open Schooling · NOIDA",
    description:
      "The NIOS Senior Secondary course is a Class 12 qualification accepted by universities and government bodies across India, with the freedom to choose your own subject combination.",
    eligibility: "Class 10 pass from any recognized board",
    subjects: ["English", "Accountancy", "Business Studies", "Economics", "Psychology"],
    highlight: "Choose any subject combination — commerce, arts or science.",
  },
];
