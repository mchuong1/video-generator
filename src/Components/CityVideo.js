import { useCallback, useEffect, useState } from 'react';
import { AbsoluteFill, Video, delayRender, continueRender, Audio, Sequence } from "remotion";
import { getRedditPost } from '../service/service';
import _ from 'lodash';
import RedditPost from './RedditPost';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { textToSpeech } from '../TextToSpeech';
import RedditComment from './RedditComment';

const CityVideo = (props) => {
  const videoUrl = "https://mc-youtube-videos.s3.amazonaws.com/82dcea05-9de4-dfda-3854-edf0d7cf5669.mp4";
  const { postId, commentIds } = props;

  const [handle] = useState(() => delayRender());
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(1);
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [commentAudioUrls, setCommentAudioUrls] = useState([]);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1,1,1]);

  const findComment = useCallback((id, collection, index = 0, depth = 1) => {
    // Test other edge cases. This worked because the first depth index had your answer
    if(_.find(collection, {id})) return _.find(collection, {id});
    if(_.get(collection[index], 'replies', []).length > 0) return findComment(id, collection[index].replies);
    return undefined;
  }, []);

  const fetchData = useCallback(async () => {
    const post = await getRedditPost(postId);
    const { title } = post;
    const fileName = await textToSpeech(title, 'enUSWoman1');
    const duration = await getAudioDurationInSeconds(fileName);

    const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
    const commentAudioUrls = await Promise.all(_.map(comments, async comment => textToSpeech(comment.body, 'enUSWoman1')));
    const commentAudioDurations = await Promise.all(_.map(commentAudioUrls, async urls => getAudioDurationInSeconds(urls)));
    console.log(commentAudioDurations)

    setPost(post);
    setAudioUrl(fileName);
    setAudioDuration(duration);
    setComments(comments);
    setCommentAudioUrls(commentAudioUrls);
    setCommentAudioDurations(commentAudioDurations);

		continueRender(handle);
	}, [handle, postId, commentIds, findComment]);

  useEffect(() => {
		fetchData();
	}, [fetchData]);

  return (
    <AbsoluteFill>
      {audioUrl ? <Audio src={audioUrl} /> : <></>}
      <Video
        src={videoUrl}
        style={{ height: '100%', transform: 'scale(3.5)' }}
        startFrom={40*30}
      />
      <Sequence from={0} durationInFrames={audioDuration * 30}>
      {
        !_.isEmpty(post) &&
        <RedditPost post={post}/>
      }
      </Sequence>
      {comments.length > 0 &&
        _.map(comments, (comment, i) => {
          const newAudioDurations = commentAudioDurations.slice(0, i);
          return (
          <Sequence from={i === 0 ? audioDuration * 30 : parseInt(_.sum(newAudioDurations) * 30, 10) + audioDuration * 30} durationInFrames={parseInt(commentAudioDurations[i] * 30, 10)}>
            <RedditComment comment={comment} />
          </Sequence>
          );
        })
      }
      {commentAudioUrls.length > 0 &&
        _.map(commentAudioUrls, (url, i) => {
          const newAudioDurations = commentAudioDurations.slice(0, i);
          const defaultStart = audioDuration * 30;
          return (
            <Sequence from={i === 0 ? parseInt(defaultStart, 10) : parseInt(_.sum(newAudioDurations)*30+defaultStart, 10)} durationInFrames={parseInt(commentAudioDurations[i] * 30, 10)}>
              <Audio src={url}/>
            </Sequence>
          )
        })
      }
    </AbsoluteFill>
  )
}

export default CityVideo;