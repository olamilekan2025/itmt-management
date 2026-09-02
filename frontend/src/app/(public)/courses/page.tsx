import type { Metadata } from "next";



import CoursesHero from "@/components/public/courses/courses-hero";
import CoursesIntroduction from "@/components/public/courses/courses-introduction";
import CoursesOverview from "@/components/public/courses/courses-overview";
import CoursesCategories from "@/components/public/courses/courses-categories";
import CoursesProcess from "@/components/public/courses/courses-process";
import CoursesRoles from "@/components/public/courses/courses-roles";
import CoursesStructure from "@/components/public/courses/courses-structure";
import CoursesTrust from "@/components/public/courses/courses-trust";
import CoursesCta from "@/components/public/courses/courses-cta";

export const metadata: Metadata = {
  title: "Courses | ITMT Management System",
  description:
    "Explore academic courses available across programmes, departments, and academic levels at ITMT.",
};

export default function CoursesPage() {
  return (

      <main>
        <CoursesHero />
        <CoursesIntroduction />
        <CoursesOverview />
        <CoursesCategories />
        <CoursesProcess />
        <CoursesRoles />
        <CoursesStructure />
        <CoursesTrust />
        <CoursesCta />
      </main>
  );
}