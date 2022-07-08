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
    fontWeight: 400,
    fontSize: '28px',
    lineHeight: '42px'
  }
}))

const SelfText = (props) => {
  const { text, wordBoundaryUrl } = props;
  const classes = useStyles();

  const [handle] = useState(() => delayRender());
  const [textArray, setTextArray] = useState('');
  const [wordBoundary, setWordBoundary] = useState([]);

  function isNumeric(str) {
		if (typeof str !== "string") return false // We only process strings!  
		return !isNaN(str) && // Use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
					 !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
	}

  const fetchData = useCallback(async () => {
    const data = await fetch(wordBoundaryUrl).then(response => response.json());
    const splitText = _.split(text, ' ');

    // Adding punction values to text
		const punctuation = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~][...]/g, '').length === 0);
		_.map(punctuation, p => {
			const index = _.indexOf(data, p)
			data[index-1].privDuration = data[index-1].privDuration + data[index].privDuration;
			data[index-1].privText = data[index-1].privText + data[index].privText;
		});
		const parsedData = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length > 0);

    // Adding numbers to text
		const numberText = _.filter(splitText, t => !isNaN(parseInt(_.replace(t,/[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, ''), 10)));
    const punctuationText = _.filter(splitText, d => _.replace(d, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length === 0);
		_.map(numberText, p => {
			const index = _.indexOf(splitText, p);
			splitText[index+1] = splitText[index] + " " + splitText[index + 1]
		});
    _.map(punctuationText, p => {
			const index = _.indexOf(splitText, p);
			splitText[index+1] = splitText[index] + " " + splitText[index + 1]
		});
    const parsedText = _.filter(splitText, t => !isNumeric(_.replace(t,/[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '')) && t.length > 0);

    setTextArray(parsedText);
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
          _.map(textArray, (t, i) => {
            const from = Math.round(_.get(wordBoundary[i], 'privAudioOffset', 0)/100000*.3*.75);
            return (
              <Sequence from={from} layout="none">
                <span>
                  {replaceBadWords(t) + ' '}
                </span>
              </Sequence>
          )})
        }
      </div>
    </Paper>
  )
}

export default SelfText;