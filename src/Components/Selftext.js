import _ from 'lodash';
import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { continueRender, delayRender, Sequence } from 'remotion';
import { useCallback, useEffect, useState } from 'react';
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
  },
  body: {
    fontFamily: 'Noto Sans, Arial, sans-serif',
    fontWeight: 500,
    fontSize: '40px',
    lineHeight: '48px'
  }
}))

const SelfText = (props) => {
  const { wordBoundaryUrl, playbackRate } = props;
  const classes = useStyles();

  const [handle] = useState(() => delayRender());
  const [wordBoundary, setWordBoundary] = useState([]);

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
    <Paper classes={{ root: classes.paper }}>
      <div className={classes.body}>
        {/* {text} */}
        {
          _.map(wordBoundary, (word) => {
            const from = Math.round(_.get(word, 'privAudioOffset', 0)/100000*.3/playbackRate);
            return (
              <Sequence from={from} layout="none">
                <span>
                  {replaceBadWords(word.privText) + ' '}
                </span>
              </Sequence>
          )})
        }
      </div>
    </Paper>
  )
}

export default SelfText;