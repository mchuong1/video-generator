import snoowrap from 'snoowrap';

const r = new snoowrap({
  userAgent: 'redditVideoGenerator',
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

export const getRedditUserIcon = async (
  userId: string
): Promise<string> => {
  const result = await r.getUser(userId).icon_img;
  return result;
}