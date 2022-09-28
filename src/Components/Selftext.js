import _ from 'lodash';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useState } from 'react';
import {
  continueRender, delayRender, Sequence,
  spring, useVideoConfig, useCurrentFrame, interpolate,
} from 'remotion';
import { replaceBadWords } from '../util/utils';

const useStyles = makeStyles(() => ({
  paper: {
    marginBottom: '10px',
    backgroundColor: '#1A1A1B !important',
    color: '#D7DADC !important',
    padding: '20px',
    textAlign: 'start',
    zIndex: 5,
    position: 'absolute',
    top: '48rem',
    left: '8rem',
    width: '800px',
    opacity: '99%'
  },
  body: {
    fontFamily: 'Noto Sans, Arial, sans-serif',
    fontWeight: 500,
    fontSize: '40px',
    lineHeight: '48px',
  },
}))

const SelfText = (props) => {
  const {
    wordBoundaryUrl, playbackRate,
    isAnimated, duration
  } = props;
  const classes = useStyles();

  const [handle] = useState(() => delayRender());
  const [wordBoundary, setWordBoundary] = useState([]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: {
      stiffness: 1000,
      overshootClamping: true,
    },
  });

  const exit = spring({
    frame: frame - duration,
    fps,
    config: {
      stiffness: 600,
      overshootClamping: true,
    },
  });

  const enterAndExit = interpolate(enter, [0,.5], [-2000, 0], { extrapolateRight: 'clamp' }) + interpolate(exit, [0,1], [0,2000])

  const fetchData = useCallback(async () => {
    const data = await fetch(wordBoundaryUrl).then(response => response.json());

    // Adding punction values to text
		const punctuation = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~][...]/g, '').length === 0);
		_.map(punctuation, p => {
			const index = _.indexOf(data, p)
			data[index-1].privDuration = data[index-1].privDuration + data[index].privDuration;
			data[index-1].privText = data[index-1].privText + data[index].privText;
		});
		const parsedData = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length > 0);

		setWordBoundary(parsedData);
    continueRender(handle);
  }, [handle, wordBoundaryUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData])

  return(
    <div className={classes.paper} style={{ transform: `translateX(${isAnimated ? enterAndExit : 0}px)` }}>
      <div className={classes.body}>
        {
          _.map(wordBoundary, (word) => {
            const from = Math.round(_.get(word, 'privAudioOffset', 0)/100000*.3/playbackRate);
            return (
              <Sequence from={from} layout="none">
                <span className={classes.word}>
                  {replaceBadWords(word.privText) + ' '}
                </span>
              </Sequence>
          )})
        }
      </div>
    </div>
  )
}

export default SelfText;