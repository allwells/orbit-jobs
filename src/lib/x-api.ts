import { TwitterApi } from "twitter-api-v2";

function getClient() {
  if (
    !process.env.X_API_KEY ||
    !process.env.X_API_SECRET ||
    !process.env.X_ACCESS_TOKEN ||
    !process.env.X_ACCESS_SECRET
  ) {
    throw new Error("Missing X API credentials");
  }

  return new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });
}

export interface TweetResult {
  tweetId: string;
  text: string;
}

export async function postThread(
  primaryTweet: string,
  replyTweet: string,
): Promise<{ primaryTweetId: string; replyTweetId: string }> {
  try {
    const client = getClient();
    const readWriteClient = client.readWrite;

    // Post primary tweet
    const primaryResult = await readWriteClient.v2.tweet(primaryTweet);

    // Post reply tweet
    const replyResult = await readWriteClient.v2.tweet({
      text: replyTweet,
      reply: { in_reply_to_tweet_id: primaryResult.data.id },
    });

    return {
      primaryTweetId: primaryResult.data.id,
      replyTweetId: replyResult.data.id,
    };
  } catch (error) {
    console.error("Failed to post thread:", error);
    throw new Error("Failed to post thread to X");
  }
}

export async function getRateLimitStatus(): Promise<{
  limit: number;
  remaining: number;
  reset: number;
}> {
  const client = getClient();
  const rateLimits = await client.v1.rateLimitStatuses();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tweetLimit = (rateLimits.resources as any)?.tweets?.["/tweets"] || {
    limit: 500,
    remaining: 500,
    reset: Math.floor(Date.now() / 1000) + 86400,
  };

  return {
    limit: tweetLimit.limit,
    remaining: tweetLimit.remaining,
    reset: tweetLimit.reset,
  };
}
