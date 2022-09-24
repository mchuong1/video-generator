import _ from 'lodash';
import React , { useState, useEffect, useCallback } from 'react';
import {
  AbsoluteFill, Series, staticFile,
  Audio, OffthreadVideo, delayRender, continueRender
} from "remotion";
import SelfText from './Selftext';
import RedditPost from './RedditPost';
import RedditComment from './RedditComment';
import video from '../../mp4/sonic_adventure.webm';
import { getVideoMetadata } from '@remotion/media-utils';
import { FollowForMore } from './FollowForMore';
import { SubtitleWordByWord } from './SubtitleWordByWord';

const RedditVideo = (props) => {
  const {
    post, comments, selfText,
    videoUrl, redditVideo, redditAudio,
    videoDuration, playbackRate, videoStart
  } = props;

  // const video = staticFile('/sonic_unleashed_windmill.webm');

  const [handle] = useState(() => delayRender());
  const [shouldScale, setShouldScale] = useState(true);

  const postAudioDuration = _.get(post, 'postAudioDuration', 1);
  const postAudioUrl = _.get(post, 'postAudioUrl', '');
  const commentArray = _.get(comments, 'comments', []);
  const commentAudioUrls = _.get(comments, 'commentAudioUrls', []);
  const commentAudioDurations = _.get(comments, 'commentAudioDurations', [1]);
  const commentWordBoundaryUrls = _.get(comments, 'commentWordBoundaryUrls', []);
  const selfTextArray = _.get(selfText, 'selfTextArray', []);
  const selfTextAudioUrls = _.get(selfText, 'selfTextAudioUrls', []);
  const selfTextAudioDurations = _.get(selfText, 'selfTextAudioDurations', [1]);
  const selfTextWordBoundaryUrls = _.get(selfText, 'selfTextWordBoundaryUrls', []);

  const fetchVideoData = useCallback(async () => {
    if(videoUrl.length > 0 ) {
      const { height, width } = await getVideoMetadata(videoUrl); 
      setShouldScale(width > height);
    }
    continueRender(handle);
  }, [handle, videoUrl])

  useEffect(() => {
		fetchVideoData();
	}, [fetchVideoData])


  const generateCommentSequence = (comment, audioDurations, audioUrls, wordBoundaryUrls) => {
    return _.map(comment.bodyArray, (text, i) => {
      const durationInFrames = Math.ceil(audioDurations[i] * 30 / playbackRate);
      return i === 0
      ? (
        <Series.Sequence durationInFrames={durationInFrames} name={comment.id}>
          <>
            <RedditComment comment={comment} wordBoundaryUrl={wordBoundaryUrls[i]} playbackRate={playbackRate}/>
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
          </>
        </Series.Sequence>
      ) : (
        <Series.Sequence durationInFrames={durationInFrames}>
          <>
            <SelfText wordBoundaryUrl={wordBoundaryUrls[i]} playbackRate={playbackRate} />
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
          </>
        </Series.Sequence>
      )
    });
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        muted
        src={videoUrl.length > 0 ? videoUrl : video}
        style={{ transform: `${shouldScale ? 'scale(3.5) translate(0px, 160px)' : ''}` }}
        startFrom={videoStart*30}
      />
      <Series>
        <Series.Sequence durationInFrames={Math.ceil(postAudioDuration * 30/playbackRate)}>
        {
          !_.isEmpty(post) &&
          <RedditPost post={post} />
        }
        {postAudioUrl?.length > 0 ? <Audio src={postAudioUrl} playbackRate={playbackRate}/> : <></>}
        </Series.Sequence>
        {selfTextArray.length > 0 && 
          _.map(selfTextArray, (text, i) => {
            return(
              <Series.Sequence key={text} durationInFrames={Math.ceil(selfTextAudioDurations[i] * 30/playbackRate)}>
                <>
                  <SelfText playbackRate={playbackRate} wordBoundaryUrl={selfTextWordBoundaryUrls[i]} />
                  <Audio src={selfTextAudioUrls[i]} playbackRate={playbackRate}/>
                </>
              </Series.Sequence>
            )
          })
        }
        {commentArray.length > 0 &&
          _.map(commentArray, (comment, i) => {
            return _.get(comment, 'bodyArray', false)
            ? generateCommentSequence(
              comment, commentAudioDurations[i],
              commentAudioUrls[i], commentWordBoundaryUrls[i]
            )
            : (
            <Series.Sequence durationInFrames={Math.ceil(commentAudioDurations[i] * 30/playbackRate)} name={comment.id}>
              <RedditComment comment={comment} wordBoundaryUrl={commentWordBoundaryUrls[i]} playbackRate={playbackRate}/>
              <Audio src={commentAudioUrls[i]} playbackRate={playbackRate}/>
            </Series.Sequence>
            );
          })
        }
        {
          redditVideo.length > 0 && 
          <Series.Sequence durationInFrames={Math.ceil(videoDuration * 30)}>
            <OffthreadVideo src={redditVideo} startFrom={120 * 30} style={{ zIndex: 5, height: 'fit-content', width: 'inherit', alignSelf: 'center' }}/>
            {redditAudio.length > 0 && <Audio src={redditAudio}/>}
          </Series.Sequence>
        }
      </Series>
    </AbsoluteFill>
  )
}

export default RedditVideo;