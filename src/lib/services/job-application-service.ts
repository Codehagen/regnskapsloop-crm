import { prisma } from "@/lib/db";
import {
  JobApplication,
  JobApplicationStatus,
  Activity,
  ActivityType,
  Prisma,
} from "@/app/generated/prisma";

export interface CreateJobApplicationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  resume?: string;
  coverLetter?: string;
  experience?: number;
  education?: string;
  skills?: string[];
  desiredPosition?: string;
  currentEmployer?: string;
  expectedSalary?: number;
  startDate?: Date;
  notes?: string;
  source?: string;
  status?: JobApplicationStatus;
}

export interface UpdateJobApplicationInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  resume?: string | null;
  coverLetter?: string | null;
  experience?: number | null;
  education?: string | null;
  skills?: string[];
  desiredPosition?: string | null;
  currentEmployer?: string | null;
  expectedSalary?: number | null;
  startDate?: Date | null;
  notes?: string | null;
  source?: string | null;
  status?: JobApplicationStatus;
}

export interface JobApplicationWithActivities extends JobApplication {
  activities: Activity[];
}

export interface IJobApplicationService {
  getJobApplications(): Promise<JobApplication[]>;
  getJobApplicationsByStatus(
    status: JobApplicationStatus
  ): Promise<JobApplication[]>;
  getJobApplicationById(id: string): Promise<JobApplication | null>;
  createJobApplication(
    data: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
  ): Promise<JobApplication>;
  updateJobApplication(
    id: string,
    data: Partial<Omit<JobApplication, "id" | "createdAt" | "updatedAt">>
  ): Promise<JobApplication>;
  updateJobApplicationStatus(
    id: string,
    status: JobApplicationStatus
  ): Promise<JobApplication>;
  deleteJobApplication(id: string): Promise<JobApplication>;
  searchJobApplications(searchTerm: string): Promise<JobApplication[]>;
  addActivity(
    jobApplicationId: string,
    data: {
      type: ActivityType;
      date: Date;
      description: string;
      completed?: boolean;
      outcome?: string;
      userId: string;
    }
  ): Promise<Activity>;
}

export const jobApplicationService: IJobApplicationService = {
  async getJobApplications(): Promise<JobApplication[]> {
    return prisma.jobApplication.findMany({
      orderBy: {
        applicationDate: "desc",
      },
    });
  },

  async getJobApplicationsByStatus(
    status: JobApplicationStatus
  ): Promise<JobApplication[]> {
    return prisma.jobApplication.findMany({
      where: {
        status: status,
      },
      orderBy: {
        applicationDate: "desc",
      },
    });
  },

  async getJobApplicationById(id: string): Promise<JobApplication | null> {
    return prisma.jobApplication.findUnique({
      where: {
        id: id,
      },
    });
  },

  async createJobApplication(
    data: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
  ): Promise<JobApplication> {
    return prisma.jobApplication.create({
      data: data,
    });
  },

  async updateJobApplication(
    id: string,
    data: Partial<Omit<JobApplication, "id" | "createdAt" | "updatedAt">>
  ): Promise<JobApplication> {
    return prisma.jobApplication.update({
      where: {
        id: id,
      },
      data: data,
    });
  },

  async updateJobApplicationStatus(
    id: string,
    status: JobApplicationStatus
  ): Promise<JobApplication> {
    return prisma.jobApplication.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  },

  async deleteJobApplication(id: string): Promise<JobApplication> {
    return prisma.jobApplication.delete({
      where: {
        id: id,
      },
    });
  },

  async searchJobApplications(searchTerm: string): Promise<JobApplication[]> {
    const term = searchTerm.toLowerCase().trim();

    return prisma.jobApplication.findMany({
      where: {
        OR: [
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
          { desiredPosition: { contains: term, mode: "insensitive" } },
          { currentEmployer: { contains: term, mode: "insensitive" } },
          { education: { contains: term, mode: "insensitive" } },
          { skills: { hasSome: [term] } },
        ],
      },
      orderBy: {
        applicationDate: "desc",
      },
    });
  },

  // Add an activity to a job application
  addActivity: async (
    jobApplicationId: string,
    data: {
      type: ActivityType;
      date: Date;
      description: string;
      completed?: boolean;
      outcome?: string;
      userId: string;
    }
  ): Promise<Activity> => {
    return prisma.activity.create({
      data: {
        ...data,
        jobApplication: {
          connect: {
            id: jobApplicationId,
          },
        },
      },
    });
  },
};

export default jobApplicationService;
