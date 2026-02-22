import { db } from "../src/lib/kysely";
import { randomUUID } from "crypto";

const MOCK_JOBS = [
  {
    job_id: "google-fe-1",
    employer_name: "Google",
    employer_logo:
      "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    employer_website: "https://google.com",
    job_publisher: "LinkedIn",
    job_employment_type: "FULLTIME",
    job_title: "Senior Frontend Engineer",
    job_apply_link: "https://google.com/careers",
    job_description:
      "We are looking for a senior frontend engineer to join our team.",
    job_is_remote: true,
    job_posted_at_timestamp: Math.floor(Date.now() / 1000),
    job_posted_at_datetime_utc: new Date().toISOString(),
    job_country: "US",
    job_city: "Mountain View",
    job_state: "CA",
    job_latitude: 37.422,
    job_longitude: -122.084,
    job_google_link: "https://google.com",
    job_offer_expiration_datetime_utc: new Date(
      Date.now() + 86400000 * 30,
    ).toISOString(),
    job_min_salary: 150000,
    job_max_salary: 220000,
    job_salary_currency: "USD",
    job_salary_period: "YEAR",
    job_benefits: ["Health", "Dental", "Vision", "401k"],
    job_required_experience: {
      no_experience_required: false,
      required_experience_in_months: 60,
      experience_mentioned: true,
      experience_preferred: true,
    },
    job_required_skills: ["React", "TypeScript", "Next.js"],
    job_job_title: "Senior Frontend Engineer",
  },
  {
    job_id: "meta-be-1",
    employer_name: "Meta",
    employer_logo:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    employer_website: "https://meta.com",
    job_publisher: "Indeed",
    job_employment_type: "CONTRACTOR",
    job_title: "Backend Engineer (Contract)",
    job_apply_link: "https://meta.com/careers",
    job_description: "Join our infrastructure team as a backend engineer.",
    job_is_remote: false,
    job_posted_at_timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
    job_posted_at_datetime_utc: new Date(
      Date.now() - 86400000 * 2,
    ).toISOString(),
    job_country: "US",
    job_city: "Menlo Park",
    job_state: "CA",
    job_latitude: 37.453,
    job_longitude: -122.182,
    job_google_link: "https://meta.com",
    job_offer_expiration_datetime_utc: new Date(
      Date.now() + 86400000 * 20,
    ).toISOString(),
    job_min_salary: 120000,
    job_max_salary: 180000,
    job_salary_currency: "USD",
    job_salary_period: "YEAR",
    job_benefits: ["Health"],
    job_required_experience: {
      no_experience_required: false,
      required_experience_in_months: 36,
      experience_mentioned: true,
      experience_preferred: true,
    },
    job_required_skills: ["Python", "Django", "PostgreSQL"],
    job_job_title: "Backend Engineer",
  },
  {
    job_id: "netflix-fs-1",
    employer_name: "Netflix",
    employer_logo:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    employer_website: "https://netflix.com",
    job_publisher: "Glassdoor",
    job_employment_type: "PARTTIME",
    job_title: "Full Stack Developer",
    job_apply_link: "https://netflix.com/jobs",
    job_description: "Help us build the next generation of streaming UI.",
    job_is_remote: true,
    job_posted_at_timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
    job_posted_at_datetime_utc: new Date(
      Date.now() - 86400000 * 5,
    ).toISOString(),
    job_country: "US",
    job_city: "Los Gatos",
    job_state: "CA",
    job_latitude: 37.226,
    job_longitude: -121.974,
    job_google_link: "https://netflix.com",
    job_offer_expiration_datetime_utc: new Date(
      Date.now() + 86400000 * 15,
    ).toISOString(),
    job_min_salary: 100000,
    job_max_salary: 160000,
    job_salary_currency: "USD",
    job_salary_period: "YEAR",
    job_benefits: ["flexible hours"],
    job_required_experience: {
      no_experience_required: true,
      required_experience_in_months: 0,
      experience_mentioned: false,
      experience_preferred: false,
    },
    job_required_skills: ["Node.js", "React", "AWS"],
    job_job_title: "Full Stack Developer",
  },
];

async function seed() {
  console.log("Starting seed...");

  for (const job of MOCK_JOBS) {
    const existing = await db
      .selectFrom("jobs")
      .select("id")
      .where("job_id", "=", job.job_id)
      .executeTakeFirst();

    if (!existing) {
      // Determine Status (Randomly distribute for UI testing)
      const statuses = ["pending", "approved", "rejected", "posted"];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      await db
        .insertInto("jobs")
        .values({
          id: randomUUID(),
          job_id: job.job_id,
          // Map employer_name to company
          company: job.employer_name,
          title: job.job_title,
          // Map apply_link to apply_url
          apply_url: job.job_apply_link,
          description: job.job_description,
          // Map is_remote to remote_allowed
          remote_allowed: job.job_is_remote,
          posted_at: job.job_posted_at_datetime_utc,
          location: `${job.job_city}, ${job.job_state}, ${job.job_country}`,

          employment_type: job.job_employment_type,
          status: randomStatus,

          salary_min: job.job_min_salary,
          salary_max: job.job_max_salary,
          salary_currency: job.job_salary_currency,

          // Arrays/JSON
          required_skills: job.job_required_skills, // generic type allows string[] usually, or explicit cast

          // Store extras in raw_data
          raw_data: {
            employer_logo: job.employer_logo,
            employer_website: job.employer_website,
            publisher: job.job_publisher,
            benefits: job.job_benefits,
            experience: job.job_required_experience,
          },

          posted_to_x: randomStatus === "posted",
          source: "mock_seed",
        })
        .execute();
      console.log(`Inserted ${job.job_title} at ${job.employer_name}`);
    } else {
      console.log(`Skipped existing ${job.job_title}`);
    }
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
