import * as https from "https";

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4
}

export interface ContributionWeek {
  days: ContributionDay[];
}

// Method 1: Public scraping (no token needed!)

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "streak-stats-readme" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpsGet(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

export async function fetchContributionsPublic(
  username: string
): Promise<{ weeks: ContributionWeek[]; total: number }> {
  const url = `https://github.com/users/${username}/contributions`;
  const html = await httpsGet(url);

  // Parse total contributions
  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
  const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 0;

  // Parse contribution cells
  // GitHub renders <td> elements with data-date and data-level attributes
  const cellRegex = /<td[^>]*data-date="([^"]+)"[^>]*data-level="(\d)"[^>]*/g;
  const days: ContributionDay[] = [];

  let match;
  while ((match = cellRegex.exec(html)) !== null) {
    days.push({
      date: match[1],
      count: 0, // not available from public page, we use level instead
      level: parseInt(match[2], 10),
    });
  }

  // Also try the alternative pattern where data-level comes before data-date
  const cellRegex2 = /<td[^>]*data-level="(\d)"[^>]*data-date="([^"]+)"[^>]*/g;
  while ((match = cellRegex2.exec(html)) !== null) {
    // Avoid duplicates
    if (!days.find((d) => d.date === match![2])) {
      days.push({
        date: match[2],
        count: 0,
        level: parseInt(match[1], 10),
      });
    }
  }

  if (days.length === 0) {
    throw new Error(
      `Could not parse contributions for "${username}". The user may not exist or GitHub changed their HTML format.`
    );
  }

  // Sort by date
  days.sort((a, b) => a.date.localeCompare(b.date));

  // Group into weeks (7 days each)
  const weeks: ContributionWeek[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push({ days: days.slice(i, i + 7) });
  }

  // Estimate counts from levels for display
  const countEstimates = [0, 2, 5, 8, 15];
  for (const week of weeks) {
    for (const day of week.days) {
      day.count = countEstimates[day.level] ?? 0;
    }
  }

  return { weeks, total };
}

// Method 2: GraphQL API (needs token, more accurate)

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
              contributionLevel:
                | "NONE"
                | "FIRST_QUARTILE"
                | "SECOND_QUARTILE"
                | "THIRD_QUARTILE"
                | "FOURTH_QUARTILE";
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function graphqlRequest(
  token: string,
  query: string,
  variables: Record<string, string>
): Promise<GraphQLResponse> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request(
      {
        hostname: "api.github.com",
        path: "/graphql",
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "streak-stats-readme",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function fetchContributionsGraphQL(
  token: string,
  username: string
): Promise<{ weeks: ContributionWeek[]; total: number }> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const response = await graphqlRequest(token, query, { username });

  if (response.errors) {
    throw new Error(
      `GitHub API error: ${response.errors.map((e) => e.message).join(", ")}`
    );
  }

  const calendar =
    response.data?.user?.contributionsCollection.contributionCalendar;
  if (!calendar) {
    throw new Error(`User "${username}" not found or no contribution data`);
  }

  const weeks: ContributionWeek[] = calendar.weeks.map((week) => ({
    days: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_MAP[day.contributionLevel] ?? 0,
    })),
  }));

  return { weeks, total: calendar.totalContributions };
}

// Auto-detect: use token if available, otherwise scrape

export async function fetchContributions(
  username: string,
  token?: string
): Promise<{ weeks: ContributionWeek[]; total: number }> {
  if (token) {
    console.log("Using GitHub GraphQL API (token provided)");
    return fetchContributionsGraphQL(token, username);
  }
  console.log("Using public contribution page (no token needed)");
  return fetchContributionsPublic(username);
}
