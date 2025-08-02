import { currentUser } from "@clerk/nextjs/server";

/**
 * Check if the current user is a super admin
 * Super admins are defined in the SUPER_ADMIN_EMAILS environment variable
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS;
  if (!superAdminEmails) return false;

  const adminEmailList = superAdminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase());

  const userEmail = user.emailAddresses[0]?.emailAddress.toLowerCase();
  if (!userEmail) return false;

  return adminEmailList.includes(userEmail);
}

/**
 * Check if a specific email is a super admin
 */
export function isEmailSuperAdmin(email: string): boolean {
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS;
  if (!superAdminEmails) return false;

  const adminEmailList = superAdminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase());

  return adminEmailList.includes(email.toLowerCase());
}