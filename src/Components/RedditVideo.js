import {
  AbsoluteFill, Series,
  Audio, OffthreadVideo,
} from "remotion";
import _ from 'lodash';
import RedditPost from './RedditPost';
import RedditComment from './RedditComment';
import SelfText from './Selftext';
import video from '../../mp4/sonic_generations.mp4';

const RedditVideo = (props) => {
  const {
    post,
    comments,
    selfText,
    redditVideo, redditAudio, videoDuration, playbackRate, videoStart
  } = props;

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


  const generateCommentSequence = (comment, audioDurations, audioUrls, wordBoundaryUrls) => {
    return _.map(comment.bodyArray, (text, i) => {
      const durationInFrames = Math.ceil(audioDurations[i] * 30 / playbackRate);
      return i === 0
      ? (
        <Series.Sequence durationInFrames={durationInFrames}>
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
        {
          redditVideo.length > 0 && 
          <Series.Sequence durationInFrames={Math.ceil(videoDuration * 30)}>
            <OffthreadVideo src={redditVideo} style={{ zIndex: 5, height: 'fit-content', width: 'inherit', alignSelf: 'center' }}/>
            {redditAudio.length > 0 && <Audio src={redditAudio}/>}
          </Series.Sequence>
        }
        {commentArray.length > 0 &&
          _.map(commentArray, (comment, i) => {
            return _.get(comment, 'bodyArray', false)
            ? generateCommentSequence(
              comment, commentAudioDurations[i],
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