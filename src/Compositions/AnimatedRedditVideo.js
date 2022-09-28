import _ from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import {
  AbsoluteFill, Series,
  Audio, OffthreadVideo, delayRender, continueRender
} from "remotion";
import SelfText from '../Components/Selftext';
import RedditPost from '../Components/RedditPost';
import RedditComment from '../Components/RedditComment';
import video from '../../mp4/sonic_generations.mp4';
import { getVideoMetadata } from '@remotion/media-utils';

const AnimatedRedditVideo = (props) => {
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
      const durationInFrames = Math.ceil((audioDurations[i]) * 30 / playbackRate);
      return i === 0
      ? (
        <Series.Sequence durationInFrames={durationInFrames+5} name={comment.id}>
          <>
            <RedditComment
              isAnimated
              comment={comment}
              wordBoundaryUrl={wordBoundaryUrls[i]}
              playbackRate={playbackRate}
              duration={durationInFrames}
            />
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
          </>
        </Series.Sequence>
      ) : (
        <Series.Sequence durationInFrames={durationInFrames+5}>
          <>
            <SelfText
              isAnimated
              wordBoundaryUrl={wordBoundaryUrls[i]}
              playbackRate={playbackRate}
              duration={durationInFrames}
            />
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
        { !_.isEmpty(post) &&
          <Series.Sequence durationInFrames={Math.ceil((postAudioDuration + .5) * 30/playbackRate)}>
            <RedditPost isAnimated post={post} wordBoundaryUrl={postWordBoundaryUrl} />
            <Audio src={postAudioUrl} playbackRate={playbackRate}/>
          </Series.Sequence>
        }
        {selfTextArray.length > 0 && 
          _.map(_.slice(selfTextArray, 0, 20), (text, i) => {
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
            <Series.Sequence durationInFrames={Math.ceil((commentAudioDurations[i] + .5) * 30/playbackRate)} name={comment.id}>
              <RedditComment
                isAnimated
                comment={comment}
                playbackRate={playbackRate}
                wordBoundaryUrl={commentWordBoundaryUrls[i]}
                duration={Math.ceil(commentAudioDurations[i] * 30/playbackRate)}
              />
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

export default AnimatedRedditVideo;