import { useCallback, useEffect, useState } from 'react';
import {
  AbsoluteFill, delayRender, continueRender,
  Audio, Sequence, OffthreadVideo,
} from "remotion";
import { getRedditPost } from '../service/service';
import _ from 'lodash';
import RedditPost from './RedditPost';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { textToSpeech } from '../TextToSpeech';
import RedditComment from './RedditComment';
import { removeUrl } from '../util/utils';
import SelfText from './Selftext';

const RedditVideo = (props) => {
  const videoUrl = "https://mc-youtube-videos.s3.amazonaws.com/82dcea05-9de4-dfda-3854-edf0d7cf5669.mp4";
  const { postId, commentIds } = props;

  const [handle] = useState(() => delayRender());
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(1);
  const [post, setPost] = useState({});
  const [selfTextArray, setSelfTextArray] = useState([]);
  const [selfTextAudioUrls, setSelfTextAudioUrls] = useState([]);
  const [selfTextAudioDurations, setSelfTextAudioDurations] = useState([1]);
  const [comments, setComments] = useState([]);
  const [commentAudioUrls, setCommentAudioUrls] = useState([]);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1,1,1]);

  const findComment = useCallback((id, collection) => {
    if(collection.length === 0) return undefined;
    if(_.find(collection, {id})) return _.find(collection, {id});
    for(let i = 0; i < collection.length; i++) {
      if(_.get(collection[i], 'replies', []).length > 0) {
        if(_.find(collection[i].replies, {id})) return _.find(collection[i].replies, {id})
      }
    }
    const newCollection = _.map(collection, listing => {
      return listing.replies;
    });
    return findComment(id, _.flattenDeep(newCollection));
  }, []);

  const fetchData = useCallback(async () => {
    const post = await getRedditPost(postId);
    const { title, selftext } = post;

    const postAudio = await textToSpeech(title, 'enUSWoman1');
    const duration = await getAudioDurationInSeconds(postAudio);
    setPost(post);
    setAudioUrl(postAudio);
    setAudioDuration(duration);

    if(selftext.length > 0) {
      const noUrlSelfText = removeUrl(selftext);
      const selfTextArray = noUrlSelfText.split(/\r?\n/);
      const filteredSelfTextArray = _.filter(selfTextArray, string => !_.isEmpty(string));
      
      const selfTextAudioUrls = await Promise.all(_.map(filteredSelfTextArray, async comment => textToSpeech(comment, 'enUSWoman1')));
      const selfTextAudioDurations = await Promise.all(_.map(selfTextAudioUrls, async urls => getAudioDurationInSeconds(urls)));
      setSelfTextArray(filteredSelfTextArray);
      setSelfTextAudioUrls(selfTextAudioUrls);
      setSelfTextAudioDurations(selfTextAudioDurations);
    }

    if(commentIds.length > 0){
      const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
      const commentAudioUrls = await Promise.all(_.map(comments, async comment => textToSpeech(_.get(comment,'body', ''), 'enUSWoman1')));
      const commentAudioDurations = await Promise.all(_.map(commentAudioUrls, async urls => getAudioDurationInSeconds(urls)));
      setComments(comments);
      setCommentAudioUrls(commentAudioUrls);
      setCommentAudioDurations(commentAudioDurations);
    }

		continueRender(handle);
	}, [handle, postId, commentIds, findComment]);

  useEffect(() => {
		fetchData();
	}, [fetchData]);

  return (
    <AbsoluteFill>
      {audioUrl ? <Audio playbackRate={1.25} src={audioUrl} /> : <></>}
      <OffthreadVideo
        src={videoUrl}
        style={{ transform: 'scale(3.5) translate(0px, 160px)' }}
        startFrom={40*30}
      />
      {
        _.get(post, 'secure_media.reddit_video.dash_url', false) &&        
        <div className="reddit_video">{_.get(post, 'secure_media.reddit_video.dash_url', false)}</div>
      }
      <Sequence from={0} durationInFrames={parseInt(audioDuration * 30/1.25,10)}>
      {
        !_.isEmpty(post) &&
        <RedditPost post={post}/>
      }
      </Sequence>
      {selfTextArray.length > 0 && 
        _.map(selfTextArray, (text, i) => {
          const newAudioDurations = selfTextAudioDurations.slice(0, i);
          const defaultStart = parseInt(audioDuration * 30/1.25, 10);
          return(
            <Sequence from={i === 0 ? defaultStart : parseInt(_.sum(newAudioDurations) * 30/1.25, 10) + defaultStart} durationInFrames={parseInt(selfTextAudioDurations[i] * 30/1.25, 10)}>
              <>
                <SelfText text={text} />
                <Audio src={selfTextAudioUrls[i]} playbackRate={1.25}/>
              </>
            </Sequence>
          )
        })
      }
      {comments.length > 0 &&
        _.map(comments, (comment, i) => {
          const newAudioDurations = commentAudioDurations.slice(0, i);
          const defaultStart = parseInt(audioDuration * 30/1.25, 10) + parseInt(_.sum(selfTextAudioDurations) * 30 / 1.25, 10);
          return (
          <Sequence from={i === 0 ? defaultStart : parseInt(_.sum(newAudioDurations) * 30/1.25, 10) + defaultStart} durationInFrames={parseInt(commentAudioDurations[i] * 30/1.25, 10)}>
            <>
              <RedditComment comment={comment} />
              <Audio src={commentAudioUrls[i]} playbackRate={1.25}/>
            </>
          </Sequence>
          );
        })
      }
    </AbsoluteFill>
  )
}

export default RedditVideo;