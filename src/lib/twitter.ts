import { TwitterApi } from "twitter-api-v2";
import pool from "./db";

const MONTHLY_POST_LIMIT = 500;

/**
 * Initialize Twitter API client
 */
function getTwitterClient() {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error("Twitter API credentials not configured");
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
  });
}

/**
 * Get the count of posts made this month
 */
export async function getMonthlyPostCount(): Promise<number> {
  const client = await pool.connect();
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await client.query(
      `SELECT COUNT(*) as count FROM twitter_post 
       WHERE posted_at >= $1 AND status = 'success'`,
      [startOfMonth.toISOString()],
    );

    return parseInt(result.rows[0]?.count || "0");
  } finally {
    client.release();
  }
}

/**
 * Get remaining posts for this month
 */
export async function getRemainingPosts(): Promise<number> {
  const used = await getMonthlyPostCount();
  return Math.max(0, MONTHLY_POST_LIMIT - used);
}

/**
 * Check if we can post (under rate limit)
 */
export async function canPost(): Promise<boolean> {
  const remaining = await getRemainingPosts();
  return remaining > 0;
}

/**
 * Format content into a Twitter thread if needed
 * Splits content into tweets of max 280 characters
 */
export function formatThread(content: string): string[] {
  const maxLength = 280;
  const tweets: string[] = [];

  // If content fits in one tweet, return it
  if (content.length <= maxLength) {
    return [content];
  }

  // Split by paragraphs/lines first
  const paragraphs = content.split("\n\n");
  let currentTweet = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed limit, start new tweet
    if (currentTweet.length + paragraph.length + 2 > maxLength) {
      if (currentTweet) {
        tweets.push(currentTweet.trim());
        currentTweet = "";
      }

      // If single paragraph is too long, split by sentences
      if (paragraph.length > maxLength) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        for (const sentence of sentences) {
          if (currentTweet.length + sentence.length + 1 > maxLength) {
            if (currentTweet) {
              tweets.push(currentTweet.trim());
            }
            currentTweet = sentence;
          } else {
            currentTweet += (currentTweet ? " " : "") + sentence;
          }
        }
      } else {
        currentTweet = paragraph;
      }
    } else {
      currentTweet += (currentTweet ? "\n\n" : "") + paragraph;
    }
  }

  if (currentTweet) {
    tweets.push(currentTweet.trim());
  }

  return tweets.length > 0 ? tweets : [content.substring(0, maxLength)];
}

/**
 * Post content to Twitter/X
 * Returns the tweet ID if successful
 */
export async function postToTwitter(
  content: string,
  jobId: string,
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const client = await pool.connect();

  try {
    // Check rate limit
    const canPostNow = await canPost();
    if (!canPostNow) {
      throw new Error("Monthly post limit reached (500/month)");
    }

    // Initialize Twitter client
    const twitter = getTwitterClient();

    // Format content into thread
    const tweets = formatThread(content);

    let tweetId: string | undefined;

    // Post first tweet
    const firstTweet = await twitter.v2.tweet(tweets[0]);
    tweetId = firstTweet.data.id;

    // Post remaining tweets as replies
    for (let i = 1; i < tweets.length; i++) {
      const reply: any = await twitter.v2.tweet({
        text: tweets[i],
        reply: { in_reply_to_tweet_id: tweetId! },
      });
      tweetId = reply.data.id; // Update to latest tweet ID
    }

    // Record successful post
    await client.query(
      `INSERT INTO twitter_post (id, job_id, tweet_id, status)
       VALUES (gen_random_uuid(), $1, $2, 'success')`,
      [jobId, tweetId],
    );

    // Update job status to 'posted'
    await client.query(`UPDATE job SET status = 'posted' WHERE id = $1`, [
      jobId,
    ]);

    return { success: true, tweetId };
  } catch (error: any) {
    console.error("Failed to post to Twitter:", error);

    // Record failed post
    try {
      await client.query(
        `INSERT INTO twitter_post (id, job_id, status, error_message)
         VALUES (gen_random_uuid(), $1, 'failed', $2)`,
        [jobId, error.message || "Unknown error"],
      );
    } catch (dbError) {
      console.error("Failed to record error:", dbError);
    }

    return {
      success: false,
      error: error.message || "Failed to post to Twitter",
    };
  } finally {
    client.release();
  }
}

/**
 * Get Twitter analytics data
 */
export async function getTwitterAnalytics() {
  const client = await pool.connect();
  try {
    const postsThisMonth = await getMonthlyPostCount();
    const remainingPosts = MONTHLY_POST_LIMIT - postsThisMonth;

    // Get recent posts
    const recentResult = await client.query(
      `SELECT * FROM twitter_post 
       ORDER BY posted_at DESC 
       LIMIT 5`,
    );

    return {
      postsThisMonth,
      remainingPosts,
      limit: MONTHLY_POST_LIMIT,
      recentPosts: recentResult.rows,
    };
  } finally {
    client.release();
  }
}
