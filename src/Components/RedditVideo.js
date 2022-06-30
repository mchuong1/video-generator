import {
  AbsoluteFill, Series,
  Audio, OffthreadVideo,
} from "remotion";
import _ from 'lodash';
import RedditPost from './RedditPost';
import RedditComment from './RedditComment';
import SelfText from './Selftext';
// Aimport video from '../../mp4/minecraft_relaxing_parkour.mp4'
import video from '../../mp4/sonic_omens.webm';

const RedditVideo = (props) => {
  const {
    post, postAudioUrl, postAudioDuration,
    comments, commentAudioUrls, commentAudioDurations,
    selfTextArray, selfTextAudioUrls, selfTextAudioDurations,
    redditVideo, redditAudio, videoDuration,
  } = props;

  const generateCommentSequence = (comment, bodyArray, audioDurations, audioUrls) => {
    return _.map(bodyArray, (text, i) => {
      const durationInFrames = Math.ceil(audioDurations[i] * 30 / 1.25);
      return i === 0
      ? (
        <Series.Sequence durationInFrames={durationInFrames}>
          <>
            <RedditComment isMulti comment={comment}/>
            <Audio src={audioUrls[i]} playbackRate={1.25}/>
          </>
        </Series.Sequence>
      ) : (
        <Series.Sequence durationInFrames={durationInFrames}>
          <>
            <SelfText text={text}/>
            <Audio src={audioUrls[i]} playbackRate={1.25}/>
          </>
        </Series.Sequence>
      )
    });
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={video}
        style={{ transform: 'scale(3.5) translate(0px, 160px)' }}
        startFrom={3705*30}
        volume={0}
      />
      <Series>
        <Series.Sequence durationInFrames={Math.ceil(postAudioDuration * 30/1.25)}>
        {
          !_.isEmpty(post) &&
          <RedditPost post={post}/>
        }
        {postAudioUrl.length > 0 ? <Audio src={postAudioUrl} playbackRate={1.25}/> : <></>}
        </Series.Sequence>
        {selfTextArray.length > 0 && 
          _.map(selfTextArray, (text, i) => {
            return(
              <Series.Sequence key={i} durationInFrames={Math.ceil(selfTextAudioDurations[i] * 30/1.25)}>
                <>
                  <SelfText text={text} />
                  <Audio src={selfTextAudioUrls[i]} playbackRate={1.25}/>
                </>
              </Series.Sequence>
            )
          })
        }
        {
          redditVideo.length > 0 && 
          <Series.Sequence durationInFrames={Math.ceil(videoDuration * 30)}>
            <OffthreadVideo src={redditVideo} style={{ zIndex: 5, height: 'fit-content', width: 'inherit', alignSelf: 'center' }}/>
            {redditAudio.length > 0 && <Audio src={redditAudio}/>}
          </Series.Sequence>
        }
        {comments.length > 0 &&
          _.map(comments, (comment, i) => {
            return _.get(comment, 'bodyArray', false)
            ? generateCommentSequence(
              comment, comment.bodyArray, commentAudioDurations[i], commentAudioUrls[i],
            )
            : (
            <Series.Sequence durationInFrames={Math.ceil(commentAudioDurations[i] * 30/1.25)}>
              <RedditComment comment={comment} />
              <Audio src={commentAudioUrls[i]} playbackRate={1.25}/>
            </Series.Sequence>
            );
          })
        }
      </Series>
    </AbsoluteFill>
  )
}

export default RedditVideo;