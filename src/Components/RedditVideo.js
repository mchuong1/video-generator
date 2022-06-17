import {
  AbsoluteFill,
  Audio, Sequence, OffthreadVideo,
} from "remotion";
import _ from 'lodash';
import RedditPost from './RedditPost';
import RedditComment from './RedditComment';
import SelfText from './Selftext';

const RedditVideo = (props) => {
  const video = "https://mc-youtube-videos.s3.amazonaws.com/minecraft_relaxing_parkour.mp4";
  const {
    post, postAudioUrl, postAudioDuration,
    comments, commentAudioUrls, commentAudioDurations,
    selfTextArray, selfTextAudioUrls, selfTextAudioDurations,
    redditVideo, redditAudio, videoDuration,
  } = props;

  const generateCommentSequence = (comment, bodyArray, audioDurations, audioUrls, defaultStart) => {
    return _.map(bodyArray, (text, i) => {
      const audioDuration = Math.ceil(_.sum(audioDurations.slice(0, i)) * 30 / 1.25);
      const durationInFrames = Math.ceil(audioDurations[i] * 30 / 1.25);
      return i === 0
      ? (
        <Sequence from={defaultStart} durationInFrames={durationInFrames}>
          <>
            <RedditComment isMulti comment={comment}/>
            <Audio src={audioUrls[i]} playbackRate={1.25}/>
          </>
        </Sequence>
      ) : (
        <Sequence from={defaultStart + audioDuration} durationInFrames={durationInFrames}>
          <>
            <SelfText text={text}/>
            <Audio src={audioUrls[i]} playbackRate={1.25}/>
          </>
        </Sequence>
      )
    });
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={video}
        style={{ transform: 'scale(3.5) translate(0px, 160px)' }}
        startFrom={818*30}
        volume={0}
      />
      {
        redditAudio.length === 0 &&
        <>
          {redditVideo.length > 0 &&
            <OffthreadVideo 
            src={redditVideo}
            style={{ zIndex: 5, transform: 'translateY(-29rem)' }}
            playbackRate={2}
            />
          }
        </>
      }
      <Sequence from={0} durationInFrames={Math.ceil(postAudioDuration * 30/1.25)}>
      {
        !_.isEmpty(post) &&
        <RedditPost post={post}/>
      }
      {postAudioUrl.length > 0 ? <Audio src={postAudioUrl} playbackRate={1.25}/> : <></>}
      </Sequence>
      {selfTextArray.length > 0 && 
        _.map(selfTextArray, (text, i) => {
          const newAudioDurations = selfTextAudioDurations.slice(0, i);
          const defaultStart = Math.ceil(postAudioDuration * 30/1.25);
          return(
            <Sequence key={i} from={i === 0 ? defaultStart : Math.ceil(_.sum(newAudioDurations) * 30/1.25) + defaultStart} durationInFrames={Math.ceil(selfTextAudioDurations[i] * 30/1.25)}>
              <>
                <SelfText text={text} />
                <Audio src={selfTextAudioUrls[i]} playbackRate={1.25}/>
              </>
            </Sequence>
          )
        })
      }
      {
        redditAudio.length > 0 && 
        <Sequence from={Math.ceil(postAudioDuration * 30/1.25,10)} durationInFrames={Math.ceil(videoDuration * 30)}>
          <OffthreadVideo src={redditVideo} style={{ zIndex: 5, height: 'fit-content', width: 'inherit', alignSelf: 'center' }}/>
          <Audio src={redditAudio}/>
        </Sequence>
      }
      {comments.length > 0 &&
        _.map(comments, (comment, i) => {
          const newAudioDuration = Math.ceil(_.sum(_.flatten(commentAudioDurations.slice(0, i))) * 30 / 1.25);
          const selfTextPlusVideoDuration = Math.ceil((_.sum(selfTextAudioDurations) > 1 ? _.sum(selfTextAudioDurations) : 0) * 30 / 1.25) + Math.ceil((videoDuration > 1 ? videoDuration : 0) * 30);
          const defaultStart = Math.ceil(postAudioDuration * 30/1.25) + selfTextPlusVideoDuration;
          return _.get(comment, 'bodyArray', false)
          ? generateCommentSequence(
            comment, comment.bodyArray, commentAudioDurations[i], commentAudioUrls[i], (defaultStart + newAudioDuration)
          )
          : (
          <Sequence from={i === 0 ? defaultStart : newAudioDuration + defaultStart} durationInFrames={Math.ceil(commentAudioDurations[i] * 30/1.25)}>
            <RedditComment comment={comment} />
            <Audio src={commentAudioUrls[i]} playbackRate={1.25}/>
          </Sequence>
          );
        })
      }
    </AbsoluteFill>
  )
}

export default RedditVideo;