import { useCallback, useEffect, useState } from 'react';
import { AbsoluteFill, Video, delayRender, Audio, continueRender } from "remotion";
import { textToSpeech } from '../TextToSpeech';
import video from '../../mp4/citypreview.mp4';

const CityVideo = (props) => {

  const { children } = props;
  const titleText = "";

  const [handle] = useState(() => delayRender());
  const [audioUrl, setAudioUrl] = useState('');

  const fetchTts = useCallback(async () => {
		const fileName = await textToSpeech(titleText, 'enUSWoman1');

		setAudioUrl(fileName);

		continueRender(handle);
	}, [handle, titleText]);

  useEffect(() => {
		fetchTts();
	}, [fetchTts]);

  return (
    <AbsoluteFill>
      {audioUrl ? <Audio src={audioUrl} /> : <></>}
      <Video src={video} style={{ height: '100%', transform: 'scale(3.5)' }}/>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '29rem',
        top: '45rem',
        backgroundColor: 'black'
        }}>
          {...children}
      </div>
    </AbsoluteFill>
  )
}

export default CityVideo;