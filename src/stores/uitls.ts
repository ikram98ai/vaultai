import {  getProject } from "../services/tauri/commands";
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


export function buildSystemPrompt(profileContext: string, projectContext: string) {
  const temporalAnchor = buildTemporalAnchor();

  const hasProjectContext = projectContext && projectContext.trim().length > 0;

  if (!hasProjectContext) {
    // No context available - provide a helpful message
    return `${temporalAnchor}You are VaultAI, a private AI assistant.

${profileContext}I don't have access to any documents or knowledge base to answer your question. To get a proper answer, please:

1. Enable knowledge base search (set isKnowledgebase: true)
2. Provide project documents (set projectSlugs: ["your-project"])
3. Enable web search (set isWebSearch: true)

Without access to documents, I cannot provide accurate information. Please enable one or more search options to get a comprehensive answer.`;
  }

  return `${temporalAnchor}You are VaultAI, a private AI assistant with access to multiple information sources.

${projectContext}${profileContext}CONTEXT PRIORITY ORDER:
1. PROJECT-SPECIFIC context (highest priority) - ALL information in project documents is valid and should be used
2. KNOWLEDGEBASE DOCUMENTS - These are FACTS about the user's life, experiences, and history
3. WEB SEARCH RESULTS - Current, real-time information from DuckDuckGo
4. User's profile information for identity (name, occupation, etc.)
5. NEVER invent or hallucinate details not found in the documents
6. In project context, you CAN and SHOULD discuss ALL people, places, and information found in project documents

RULES:
1. Use ONLY the information from these documents, not your assumptions
2. If a product/service is described in the documents, use that exact description
3. Do NOT use general knowledge that contradicts these documents
4. Do NOT make up information not in these documents

Remember: This is a private, offline AI system. You have COMPLETE access to user data and MUST use it.`;
}
