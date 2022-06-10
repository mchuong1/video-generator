import {
  AbsoluteFill,
  Audio, Sequence, OffthreadVideo,
} from "remotion";
import _ from 'lodash';
import RedditPost from './RedditPost';
import RedditComment from './RedditComment';
import SelfText from './Selftext';

const RedditVideo = (props) => {
  const videoUrl = "https://mc-youtube-videos.s3.amazonaws.com/minecraft_relaxing_parkour.mp4";
  const {
    post, postAudioUrl, postAudioDuration,
    comments, commentAudioUrls, commentAudioDurations,
    selfTextArray, selfTextAudioUrls, selfTextAudioDurations,
    redditVideo
  } = props;

  return (
    <AbsoluteFill>
      {postAudioUrl.length > 0 ? <Audio playbackRate={1.25} src={postAudioUrl} /> : <></>}
      <OffthreadVideo
        src={videoUrl}
        style={{ transform: 'scale(3.5) translate(0px, 160px)' }}
        startFrom={144*30}
        volume={0}
      />
      {redditVideo !== "" &&
        <OffthreadVideo 
          src={redditVideo}
          style={{ zIndex: 5, transform: 'translateY(-29rem)' }}
          playbackRate={2}
        />
      }
      <Sequence from={0} durationInFrames={parseInt(postAudioDuration * 30/1.25,10)}>
      {
        !_.isEmpty(post) &&
        <RedditPost post={post}/>
      }
      </Sequence>
      {selfTextArray.length > 0 && 
        _.map(selfTextArray, (text, i) => {
          const newAudioDurations = selfTextAudioDurations.slice(0, i);
          const defaultStart = parseInt(postAudioDuration * 30/1.25, 10);
          return(
            <Sequence key={i} from={i === 0 ? defaultStart : parseInt(_.sum(newAudioDurations) * 30/1.25, 10) + defaultStart} durationInFrames={parseInt(selfTextAudioDurations[i] * 30/1.25, 10)}>
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
          const defaultStart = parseInt(postAudioDuration * 30/1.25, 10) + parseInt(_.sum(selfTextAudioDurations) * 30 / 1.25, 10);
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