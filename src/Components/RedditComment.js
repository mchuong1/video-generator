import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { getRedditUserIcon } from '../service/service';
import { continueRender, delayRender, Img, Sequence } from 'remotion';
import { replaceBadWords, removeUrl } from '../util/utils';

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
    lineHeight: '48px',
    // position: 'absolute',
    // top: '48rem',
    // left: '5rem',
    // width: '800px',
    // opacity: '99%'
  },
  // word: {
  //   WebkitTextStrokeColor: 'black',
  //   WebkitTextStrokeWidth: '5px',
  //   fontSize: '70px',
  //   color: 'white',
  //   textShadow: '0px 0px 12px #000000'
  // }
}));

const RedditComment = (props) => {
  const { comment, wordBoundaryUrl, playbackRate } = props;
  const classes = useStyles(props);
  const {
    author, created,
    all_awardings: allAwards,
  } = comment;

  const [handle] = useState(() => delayRender());
  const [userIcon, setUserIcon] = useState('');
  const [wordBoundary, setWordBoundary] = useState([]);


  const fetchData = useCallback(async() => {
    if(author.name !== '[deleted]'){
      const data = await getRedditUserIcon(author.name);
      // eslint-disable-next-line no-negated-condition
      !_.isNil(data) ? setUserIcon(data) : null;
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

		setWordBoundary(parsedData);
    continueRender(handle);
  }, [handle, author, wordBoundaryUrl]);

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
          {
            _.map(wordBoundary, word => {
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
      </Paper>
    </>
  )
};

RedditComment.propTypes = {
  comment: PropTypes.shape({}).isRequired,
  wordBoundaryUrl: PropTypes.string.isRequired,
};

RedditComment.defaulProps = {
  isMulti: false
}

export default RedditComment;