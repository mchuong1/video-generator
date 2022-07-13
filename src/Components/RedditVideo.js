import {
  AbsoluteFill, Series,
  Audio, OffthreadVideo,
} from "remotion";
import _ from 'lodash';
import RedditPost from './RedditPost';
import RedditComment from './RedditComment';
import SelfText from './Selftext';
// Aimport video from '../../mp4/minecraft_relaxing_parkour.mp4'
import video from '../../mp4/sonic_generations.mp4';
import { SubtitleWordByWord } from "./SubtitleWordByWord";

const RedditVideo = (props) => {
  const {
    post, postAudioUrl, postAudioDuration,
    comments, commentAudioUrls, commentAudioDurations, commentWordBoundaryUrls,
    selfTextArray, selfTextAudioUrls, selfTextAudioDurations, selfTextWordBoundaryUrls,
    redditVideo, redditAudio, videoDuration, playbackRate, videoStart
  } = props;

  // eslint-disable-next-line max-params
  const generateCommentSequence = (comment, bodyArray, audioDurations, audioUrls, wordBoundaryUrls) => {
    return _.map(bodyArray, (text, i) => {
      const durationInFrames = Math.ceil(audioDurations[i] * 30 / playbackRate);
      return i === 0
      ? (
        <Series.Sequence durationInFrames={durationInFrames}>
          <>
            <RedditComment isMulti comment={comment} wordBoundaryUrl={wordBoundaryUrls[i]} playbackRate={playbackRate}/>
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
          </>
        </Series.Sequence>
      ) : (
        <Series.Sequence durationInFrames={durationInFrames}>
          <>
            <SelfText text={text} wordBoundaryUrl={wordBoundaryUrls[i]} playbackRate={playbackRate} />
            <Audio src={audioUrls[i]} playbackRate={playbackRate}/>
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
        startFrom={videoStart*30}
        volume={0}
      />
      <Series>
        <Series.Sequence durationInFrames={Math.ceil(postAudioDuration * 30/playbackRate)}>
        {
          !_.isEmpty(post) &&
          <RedditPost post={post} />
        }
        {postAudioUrl.length > 0 ? <Audio src={postAudioUrl} playbackRate={playbackRate}/> : <></>}
        </Series.Sequence>
        {selfTextArray.length > 0 && 
          _.map(selfTextArray, (text, i) => {
            return(
              <Series.Sequence key={text} durationInFrames={Math.ceil(selfTextAudioDurations[i] * 30/playbackRate)}>
                <>
                  <SelfText text={text} playbackRate={playbackRate} wordBoundaryUrl={selfTextWordBoundaryUrls[i]} />
                  {/* <SubtitleWordByWord subtitle={text} playbackRate={playbackRate} wordBoundaryUrl={selfTextWordBoundaryUrls[i]}/> */}
                  <Audio src={selfTextAudioUrls[i]} playbackRate={playbackRate}/>
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
              comment, comment.bodyArray, commentAudioDurations[i],
              commentAudioUrls[i], commentWordBoundaryUrls[i]
            )
            : (
            <Series.Sequence durationInFrames={Math.ceil(commentAudioDurations[i] * 30/playbackRate)}>
              <RedditComment comment={comment} wordBoundaryUrl={commentWordBoundaryUrls[i]} playbackRate={playbackRate}/>
              <Audio src={commentAudioUrls[i]} playbackRate={playbackRate}/>
            </Series.Sequence>
            );
          })
        }
      </Series>
    </AbsoluteFill>
  )
}

export default RedditVideo;