import snoowrap from 'snoowrap';

const r = new snoowrap({
  userAgent: 'redditVideoG',
  clientId: process.env.REMOTION_CLIENT_ID,
  clientSecret: process.env.REMOTION_CLIENT_SECRET,
  username: process.env.REMOTION_REDDIT_USERNAME,
  password: process.env.REMOTION_REDDIT_PASSWORD
});

export const getRedditPost = (
  postId: string
): Promise<object> => {
  const result = r.getSubmission(postId)
    .expandReplies({limit: 1, depth: 0});
  return result;
}

export const getSubredditIcon = (
  subreddit: string
): string => {
  const result = r.getSubreddit(subreddit)
  return result.community_icon;
}