import { makeStyles } from '@mui/styles';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { getRedditUserIcon } from '../service/service';
import {
  continueRender, delayRender, Img, Sequence,
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
  }
}));

const RedditComment = (props) => {
  const {
    comment, wordBoundaryUrl, playbackRate,
    isAnimated, duration
  } = props;
  const classes = useStyles(props);
  const {
    author, created,
    all_awardings: allAwards,
  } = comment;

  const [handle] = useState(() => delayRender());
  const [userIcon, setUserIcon] = useState('');
  const [wordBoundary, setWordBoundary] = useState([]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const regexExp = /[!'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g;

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


  const fetchData = useCallback(async() => {
    if(author.name !== '[deleted]'){
      const data = await getRedditUserIcon(author.name);
      // eslint-disable-next-line no-negated-condition
      !_.isNil(data) ? setUserIcon(data) : null;
    }

    const data = await fetch(wordBoundaryUrl).then(response => response.json());

		setWordBoundary(data);
    continueRender(handle);
  }, [handle, author, wordBoundaryUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  return(
    <>
      <div className={classes.paper} style={{ transform: `translateX(${isAnimated ? enterAndExit : 0}px)` }}>
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
            _.map(wordBoundary, (word, i) => {
              const from = Math.round(_.get(word, 'privAudioOffset', 0)/100000*.3/playbackRate);
              let testWord
              if (i < wordBoundary.length - 1)
                testWord = regexExp.test(wordBoundary[i+1].privText) ? replaceBadWords(word.privText) : replaceBadWords(word.privText) + ' ';
              else
                testWord = replaceBadWords(word.privText) + ' ';
              if (isAnimated)
                return (
                  <Sequence from={from} layout="none" name={testWord}>
                    <span className={classes.word}>
                      {testWord}
                    </span>
                  </Sequence>
                )
              return (
                <span className={classes.word}>
                  {replaceBadWords(word.privText) + ' '}
                </span>
              )
            })
          }
        </div>
      </div>
    </>
  )
};

RedditComment.propTypes = {
  comment: PropTypes.shape({}).isRequired,
  wordBoundaryUrl: PropTypes.string.isRequired,
  duration: PropTypes.number,
};

RedditComment.defaulProps = {
  isAnimated: false,
  duration: 0,
}

export default RedditComment;