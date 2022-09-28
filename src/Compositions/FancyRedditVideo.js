import _ from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import {
  AbsoluteFill, Series, staticFile,
  Audio, OffthreadVideo, delayRender, continueRender
} from "remotion";
import SelfText from '../Components/Selftext';
import RedditPost from '../Components/RedditPost';
import RedditComment from '../Components/RedditComment';
import video from '../../mp4/sonic_generations.mp4';
import { getVideoMetadata } from '@remotion/media-utils';

const FancyRedditVideo = (props) => {
  const {
    post, comments, selfText,
    videoUrl, redditVideo, redditAudio,
    videoDuration, playbackRate, videoStart
  } = props;

  const [shouldScale, setShouldScale] = useState(true);
  const [handle] = useState(() => delayRender());

  const postAudioDuration = _.get(post, 'postAudioDuration', 1);
  const postAudioUrl = _.get(post, 'postAudioUrl', '');
  const postWordBoundaryUrl = _.get(post, 'postWordBoundaryUrl', '');
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
  }, [handle, videoUrl]);

  useEffect(() => {
		fetchVideoData();
	}, [fetchVideoData]);

  const generateCommentSequence = (comment, audioDurations, audioUrls, wordBoundaryUrls) => {
    return _.map(comment.bodyArray, (text, i) => {
      const durationInFrames = Math.ceil(audioDurations[i] * 30 / playbackRate);
      return i === 0
      ? (
          <>
            <RedditComment comment={comment} wordBoundaryUrl={wordBoundaryUrls[i]} playbackRate={playbackRate}/>
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
          </>
      ) : (
          <>
            <SelfText wordBoundaryUrl={wordBoundaryUrls[i]} playbackRate={playbackRate} />
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
          </>
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
      {
        !_.isEmpty(post) && (
          <>
            <RedditPost isAnimated post={post} wordBoundaryUrl={postWordBoundaryUrl} playbackRate={playbackRate} />
            <Audio src={postAudioUrl} playbackRate={playbackRate}/>
          </>
        )
      }
      {commentArray.length > 0 &&
          _.map(commentArray, (comment, i) => {
            return _.get(comment, 'bodyArray', false)
            ? generateCommentSequence(
              comment, commentAudioDurations[i],
              commentAudioUrls[i], commentWordBoundaryUrls[i]
            )
            : (
              <>
                <RedditComment comment={comment} wordBoundaryUrl={commentWordBoundaryUrls[i]} playbackRate={playbackRate}/>
                <Audio src={commentAudioUrls[i]} playbackRate={playbackRate}/>
              </>
            );
          })
        }
    </AbsoluteFill>
  )
}

export default FancyRedditVideo;