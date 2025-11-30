

import { placeholderImages as originalPlaceholderImages } from "./placeholder-images-data";
import { API_BASE_URL } from "./api";

// New type to match the API response for a single contribution
export type ApiContribution = {
  id: string;
  title: string;
  price: string;
  course_code: string | null;
  thumbnail_image: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  related_University: {
    id: string;
    name: string;
  } | null;
  ratings: string;
  total_views: number;
  created_at: string;
  updated_at: string;
  // Assuming author details might come from another source or need to be mapped.
  // For now, let's add placeholder fields if needed by components.
  author: string; 
  authorImage: string;
};

export type ApiContributionDetail = {
  id: string;
  user: number;
  title: string;
  author_name: string;
  author_image: string | null;
  course_code: string | null;
  description: string;
  thumbnail_image: string | null;
  price: string;
  related_University: {
    id: string;
    name: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  ratings: string;
  total_views: number;
  active: boolean;
  created_at: string;
  contributionVideos: {
    id: string;
    title: string;
    total_views: number;
  }[];
  contributionNotes: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }[];
};

export type ApiComment = {
  id: string;
  comment: string;
  user: string; // Username as a string
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
};

// Existing type used by components, which we will adapt to
export type Contribution = {
  id: string;
  title: string;
  author: string;
  authorImage: string;
  description: string;
  image: string;
  imageHint: string;
  enrollmentCount: number;
  duration: string;
  lessons: { id: string; title: string; duration: string; videoUrl?: string }[];
};

export const placeholderImages = originalPlaceholderImages;

export const contributions: Contribution[] = [
  {
    id: "1",
    title: "Introduction to Calculus",
    author: "Alex Johnson",
    authorImage: placeholderImages.find(p => p.id === 'user-avatar-main')?.imageUrl || "https://picsum.photos/seed/user/40/40",
    description: "Master the fundamentals of calculus, from limits to integrals. This course is perfect for beginners and those looking to refresh their knowledge.",
    image: placeholderImages.find(p => p.id === 'math-course')?.imageUrl || "https://picsum.photos/seed/math101/600/400",
    imageHint: "mathematics blackboard",
    enrollmentCount: 1284,
    duration: "8 hours",
    lessons: [
      { id: "l1", title: "Understanding Limits", duration: "25 mins" },
      { id: "l2", title: "Introduction to Derivatives", duration: "45 mins" },
      { id: "l3", title: "Differentiation Rules", duration: "55 mins" },
      { id: "l4", title: "Introduction to Integrals", duration: "40 mins" },
      { id: "l5", title: "The Fundamental Theorem of Calculus", duration: "50 mins" },
    ],
  },
  {
    id: "2",
    title: "Classical Mechanics",
    author: "Prof. Ben Carter",
    authorImage: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || "https://picsum.photos/seed/ben/40/40",
    description: "Explore the world of physics through Newton's laws, energy, momentum, and rotational motion. A foundational course for all science and engineering students.",
    image: placeholderImages.find(p => p.id === 'physics-course')?.imageUrl || "https://picsum.photos/seed/physics202/600/400",
    imageHint: "physics experiment",
    enrollmentCount: 892,
    duration: "12 hours",
    lessons: [
      { id: "l1", title: "Kinematics", duration: "1 hour" },
      { id: "l2", title: "Newton's Laws of Motion", duration: "1.5 hours" },
      { id: "l3", title: "Work and Energy", duration: "1.5 hours" },
      { id: "l4", title: "Momentum and Collisions", duration: "1 hour" },
    ],
  },
  {
    id: "3",
    title: "Organic Chemistry Fundamentals",
    author: "Dr. Olivia Chen",
    authorImage: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || "https://picsum.photos/seed/olivia/40/40",
    description: "A comprehensive introduction to organic chemistry, covering structure, bonding, and reactions of organic compounds. Includes interactive lab simulations.",
    image: placeholderImages.find(p => p.id === 'chemistry-course')?.imageUrl || "https://picsum.photos/seed/chem303/600/400",
    imageHint: "chemistry lab",
    enrollmentCount: 2103,
    duration: "15 hours",
    lessons: [
      { id: "l1", title: "Structure and Bonding", duration: "2 hours" },
      { id: "l2", title: "Alkanes and Cycloalkanes", duration: "2 hours" },
      { id: "l3", title: "Stereochemistry", duration: "2.5 hours" },
      { id: "l4", title: "Substitution and Elimination Reactions", duration: "3 hours" },
    ],
  },
  {
    id: "4",
    title: "Data Structures & Algorithms",
    author: "Samuel Jones",
    authorImage: placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl || "https://picsum.photos/seed/samuel/40/40",
    description: "Learn core data structures and algorithms in Python to prepare for technical interviews and build more efficient software.",
    image: placeholderImages.find(p => p.id === 'cs-course')?.imageUrl || "https://picsum.photos/seed/cs404/600/400",
    imageHint: "computer code",
    enrollmentCount: 3450,
    duration: "20 hours",
    lessons: [
      { id: "l1", title: "Big O Notation", duration: "1 hour" },
      { id: "l2", title: "Arrays and Strings", duration: "3 hours" },
      { id: "l3", title: "Linked Lists, Stacks, Queues", duration: "4 hours" },
      { id: "l4", title: "Trees and Graphs", duration: "6 hours" },
      { id: "l5", title: "Sorting and Searching", duration: "4 hours" },
    ],
  },
  {
    id: "5",
    title: "World History: 1500-Present",
    author: "Dr. Arthur Diaz",
    authorImage: placeholderImages.find(p => p.id === 'user-avatar-5')?.imageUrl || "https://picsum.photos/seed/arthur/40/40",
    description: "Journey through the major events, figures, and transformations that have shaped the modern world since the age of exploration.",
    image: placeholderImages.find(p => p.id === 'history-course')?.imageUrl || "https://picsum.photos/seed/hist505/600/400",
    imageHint: "historical map",
    enrollmentCount: 642,
    duration: "10 hours",
    lessons: [
      { id: "l1", title: "The Renaissance and Reformation", duration: "2 hours" },
      { id: "l2", title: "Age of Revolutions", duration: "2 hours" },
      { id: "l3", title: "The World Wars", duration: "3 hours" },
      { id: "l4", title: "The Cold War and Beyond", duration: "3 hours" },
    ],
  },
  {
    id: "6",
    title: "American Literature Survey",
    author: "Prof. Chloe Garcia",
    authorImage: placeholderImages.find(p => p.id === 'user-avatar-6')?.imageUrl || "https://picsum.photos/seed/chloe/40/40",
    description: "A survey of major American authors and literary movements from the colonial period to the 20th century. Dive into the works of Hawthorne, Melville, and Faulkner.",
    image: placeholderImages.find(p => p.id === 'literature-course')?.imageUrl || "https://picsum.photos/seed/lit606/600/400",
    imageHint: "books library",
    enrollmentCount: 451,
    duration: "9 hours",
    lessons: [
      { id: "l1", title: "Early American and Colonial Period", duration: "1.5 hours" },
      { id: "l2", title: "American Romanticism", duration: "2 hours" },
      { id: "l3", title: "Realism and Naturalism", duration: "2.5 hours" },
      { id: "l4", "title": "Modernism", duration: "3 hours" },
    ],
  },
];

export const user = {
    name: "Alex Johnson",
    email: "student@cglage.edu",
    avatar: placeholderImages.find(p => p.id === 'user-avatar-main')?.imageUrl || "https://picsum.photos/seed/user/100/100",
    isLoggedIn: false,
    enrolled_courses: [
        contributions[2],
        contributions[3]
    ],
    progress: {
        "3": 45,
        "4": 25,
    }
};

// Helper function to get full image URL
export const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return 'https://picsum.photos/seed/placeholder/600/400';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `${API_BASE_URL}/${path}`;
};

    