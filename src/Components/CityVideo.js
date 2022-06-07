import { useCallback, useEffect, useState } from 'react';
import { AbsoluteFill, Video, delayRender, continueRender, Audio, Sequence } from "remotion";
import { getRedditPost } from '../service/service';
import _ from 'lodash';
import RedditPost from './RedditPost';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { textToSpeech } from '../TextToSpeech';

const CityVideo = (props) => {
  const videoUrl = "https://mc-youtube-videos.s3.amazonaws.com/82dcea05-9de4-dfda-3854-edf0d7cf5669.mp4";
  const { postId } = props;

  const [handle] = useState(() => delayRender());
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(1);
  const [post, setPost] = useState({});

  const fetchData = useCallback(async () => {
    const post = await getRedditPost(postId);
    const { title } = post;
    const fileName = await textToSpeech(title, 'enUSWoman1');
    const duration = await getAudioDurationInSeconds(fileName);


    setPost(post);
    setAudioUrl(fileName);
    setAudioDuration(duration);

		continueRender(handle);
	}, [handle, postId]);

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
    </AbsoluteFill>
  )
}

export default CityVideo;