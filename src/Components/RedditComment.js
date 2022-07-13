import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { getRedditUserIcon } from '../service/service';
import { continueRender, delayRender, Img, Sequence } from 'remotion';
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
  userIcon: {
    borderRadius: '50%',
    height: '60px',
    marginRight: '5px'
  },
  progress: {
    marginRight: '5px'
  },
  header: {
    display: 'flex',
    fontFamily: 'IBMPlexSans, Arial, sans-serif',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    color: '#818384',
    padding: '5px 0px',
    marginBottom: '5px'
  },
  author: {
    color: '#d7dadc',
    alignSelf: 'center'
  },
  awardsbar: {
    fontFamily: 'IBMPlexSans, Arial, sans-serif',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    color: '#818384',
    display: 'flex',
    marginBottom: '24px',
    backgroundColor: '#272729',
    padding: '10px',
    width: 'fit-content'
  },
  award: {
    marginRight: '5px',
    width: '32px'
  },
  awardcount: {
    marginRight: '5px'
  },
  body: {
    fontFamily: 'Noto Sans, Arial, sans-serif',
    fontWeight: 500,
    fontSize: '40px',
    lineHeight: '48px'
  }
}));

const RedditComment = (props) => {
  const { comment, isMulti, wordBoundaryUrl, playbackRate } = props;
  const classes = useStyles(props);
  const {
    author, body, created,
    all_awardings: allAwards,
  } = comment;

  const text = isMulti ? _.split(_.get(comment, 'bodyArray[0]'), ' ') : _.split(body, ' ');

  const [handle] = useState(() => delayRender());
  const [userIcon, setUserIcon] = useState('');
  const [textArray, setTextArray] = useState([]);
  const [wordBoundary, setWordBoundary] = useState([]);

  function isNumeric(str) {
		if (typeof str !== "string") return false // We only process strings!  
		return !isNaN(str) && // Use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
					 !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
	}

  const fetchData = useCallback(async() => {
    if(author.name !== '[deleted]'){
      const data = await getRedditUserIcon(author.name);
      setUserIcon(data)
    }

    const data = await fetch(wordBoundaryUrl).then(response => response.json());

		// Adding punction values to text
		const punctuation = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~][...]/g, '').length === 0);
		_.map(punctuation, p => {
			const index = _.indexOf(data, p)
			data[index-1].privDuration = data[index-1].privDuration + data[index].privDuration;
			data[index-1].privText = data[index-1].privText + data[index].privText;
		});
		const parsedData = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length > 0);

    // Adding numbers to text
		// const numberText = _.filter(text, t => !isNaN(parseInt(_.replace(t,/[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, ''), 10)));
    // const punctuationText = _.filter(text, d => _.replace(d, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length === 0);
		// _.map(numberText, p => {
		// 	const index = _.indexOf(text, p);
		// 	text[index+1] = text[index] + " " + text[index + 1]
    //   _.replace(text[index+1], 'undefined', '');
		// });
    // _.map(punctuationText, p => {
		// 	const index = _.indexOf(text, p);
		// 	text[index+1] = text[index] + " " + text[index + 1]
		// });

    // const parsedText = _.filter(text, t => !isNumeric(_.replace(t,/[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '')) && t.length > 0);

    setTextArray(text);
		setWordBoundary(parsedData);
    continueRender(handle);
  }, [handle, author]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  return(
    <>
      <Paper classes={{ root: classes.paper }}>
        <div className={classes.header}>
          {
            userIcon !== '' &&
            <Img className={classes.userIcon} src={userIcon} alt="user"/>
          }
          <div className={classes.author}>
            {author.name} <span style={{color: '#818384'}}>{moment(created * 1000).fromNow()}</span>
          </div>
        </div>
        {allAwards.length > 0 &&
          <div className={classes.awardsbar}>
            {_.map(_.sortBy(allAwards, ['name']), (award, i) => (
              <>
                <Img key={award.name} className={classes.award} src={award.resized_static_icons[1].url} alt={award.name}/>
                {award.count > 1 && <span key={i} className={classes.awardcount}>{award.count}</span>}
              </>
            ))}
          </div>
        }
        <div className={classes.body}>
        {/* {isMulti ? _.get(comment, 'bodyArray[0]') : replaceBadWords(body)} */}
          {
            _.map(textArray, (t, i) => {
              const from = Math.round(_.get(wordBoundary[i], 'privAudioOffset', 0)/100000*.3/playbackRate);
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
    </>
  )
};

RedditComment.propTypes = {
  comment: PropTypes.shape({}).isRequired,
  isMulti: PropTypes.bool,
  wordBoundaryUrl: PropTypes.string.isRequired,
};

RedditComment.defaulProps = {
  isMulti: false
}

export default RedditComment;