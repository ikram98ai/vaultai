import { getProject } from "../services/tauri/commands";
import { useAppStore } from "./appStore";

export function buildProfileContext(): string {
  // get user profile from app store
  const appStore = useAppStore.getState();
  const profile = appStore.userProfile;

  if (!profile || !profile.name) return "";

  return `[USER PROFILE]
Name: ${profile.name}${profile.aliases ? ` (${profile.aliases})` : ""}
${profile.pronouns ? `Pronouns: ${profile.pronouns}` : ""}
${profile.location ? `Location: ${profile.location}` : ""}
${profile.occupation ? `Occupation: ${profile.occupation}` : ""}
${profile.employer ? `Employer: ${profile.employer}` : ""}
${profile.interests ? `Interests: ${profile.interests}` : ""}
${profile.relationships ? `Relationships: ${profile.relationships}` : ""}
${profile.notes ? `Notes: ${profile.notes}` : ""}

`;
}

export async function buildProjectContext(
  projectIds?: string[],
): Promise<string> {
  if (projectIds && projectIds.length === 0) return "";
  let projects = [];
  for (const id of projectIds || []) {
    const project = await getProject(id);
    if (project) {
      projects.push(project);
    }
  }
  if (projects.length === 0) return "";

  return `[PROJECT CONTEXT]
You are working within the following project(s): ${projects.map((p) => p.name).join(", ")}
${projects.map((p) => (p.description ? `- ${p.name}: ${p.description}` : "")).join("\n")}

When answering questions:
- Prioritize information from these project documents
- Use "we" when referring to work in these projects
- Reference project-specific details when relevant
- You can discuss ALL people, places, and information found in project documents

`;
}

function buildTemporalAnchor() {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeString = currentDate.toLocaleTimeString("en-US");

  return `TEMPORAL ANCHOR - CRITICAL FOR ALL TIME REFERENCES:
Current Date: ${dateString}
Current Time: ${timeString}
Use this as your reference point for ANY temporal reference.

`;
}

export function buildSystemPrompt(
  profileContext: string,
  projectContext: string,
) {
  const temporalAnchor = buildTemporalAnchor();

  const hasProjectContext = projectContext && projectContext.trim().length > 0;

  if (!hasProjectContext) {
    // No context available - provide a helpful message
    return `${temporalAnchor}You are VaultAI, a private AI assistant designed to help users by leveraging their personal knowledge and reponsing in helpful ways.

${profileContext}`;
  }

  return `${temporalAnchor}You are VaultAI, a private AI assistant designed to help users by leveraging their personal knowledge base and documents.

${projectContext}${profileContext}`;
}
