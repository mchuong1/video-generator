import { Paper } from '@mui/material';
import PropTypes from 'prop-types'
import { getSubredditIcon } from '../service/service';
import _ from 'lodash';
import moment from 'moment';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';
import {
  continueRender, delayRender, Img, spring,
  useVideoConfig, useCurrentFrame, interpolate,
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
  communityIcon: {
    borderRadius: '50%',
    height: '60px',
    marginRight: '5px'
  },
  progress: {
    marginRight: '5px'
  },
  author: {
    marginRight: '5px'
  },
  title: {
    fontFamily: 'IBMPlexSans, Arial, sans-serif',
    fontSize: '40px',
    lineHeight: '48px',
    fontWeight: '500',
    marginBottom: '10px',
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
    width: '900',
    flexWrap: 'wrap'
  },
  award: {
    marginRight: '5px',
    width: '32px'
  },
  awardcount: {
    marginRight: '5px'
  },
  headerbar: {
    display: 'flex',
    fontFamily: 'IBMPlexSans, Arial, sans-serif',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    color: '#818384',
    padding: '5px 0px'
  },
  linkFlair: {
    fontFamily: 'IBMPlexSans, Arial, sans-serif',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: '500',
    color: 'white',
    width: 'fit-content',
    borderRadius: '15px',
    padding: '1px 7px'
  },
  word: {
    '& span': {
      display: 'inline',
    },
    display: 'inline-block'
  },
  spacedWord: {
    '& span': {
      display: 'inline',
    },
    display: 'inline-block',
    marginRight: '10px'
  }
}))

const RedditPost = (props) => {
  const { post, playbackRate, isAnimated } = props;
  const classes = useStyles();
  const [handle] = useState(() => delayRender());
  const [communityIcon, setCommunityIcon] = useState('');
  const [wordBoundary, setWordBoundary] = useState([]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const duration = _.get(post, 'postAudioDuration', 1);
  const wordBoundaryUrl = _.get(post, 'postWordBoundaryUrl', '');
  const regexExp = /[!'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g;

  const {
    title, author,
    subreddit, created,
    over_18: over18,
    link_flair_text: linkFlairText,
    link_flair_background_color: linkFlairColor,
    subreddit_name_prefixed: subredditPrefixed,
    all_awardings: allAwards,
  } = post

  const enter = spring({
    frame,
    fps,
    config: {
      stiffness: 1000,
      overshootClamping: true,
    },
  });

  const exit = spring({
    frame: frame - (duration*30/playbackRate),
    fps,
    config: {
      stiffness: 600,
      overshootClamping: true,
    },
  });

  const enterAndExit = interpolate(enter, [0,.5], [-2000, 0], { extrapolateRight: 'clamp' }) + interpolate(exit, [0,1], [0,2000])

  const fetchData = useCallback(async() => {
    const communityIconData = await getSubredditIcon(subreddit.display_name);
    setCommunityIcon(communityIconData);

    const data = await fetch(wordBoundaryUrl).then(response => response.json());
    console.log(data)

		setWordBoundary(data);
    continueRender(handle);
  }, [handle, subreddit, wordBoundaryUrl])

  useEffect(() => {
    fetchData();
  },[fetchData])

  return (
    <>
      <div className={classes.paper} style={{ transform: `translateX(${isAnimated ? enterAndExit : 0}px)` }}>
        <div className={classes.headerbar}>
          {
            communityIcon !== '' &&
            <Img className={classes.communityIcon} src={communityIcon} alt={subreddit}/>
          }
          <div className='container'>
            <div className="subredditPrefixed">{subredditPrefixed}</div>
            <div className={classes.author}>u/{author.name} {moment(created*1000).fromNow()}</div>
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
        <div className={classes.title}>
          {isAnimated ?
            _.map(wordBoundary, (word, i) => {
              const from = Math.round(_.get(word, 'privAudioOffset', 0)/100000*.3/playbackRate);
              const scale = spring({
                frame: frame - from,
                fps,
                config: {
                  stiffness: 600,
                  overshootClamping: true,
                },
                durationInFrames: 15
              });
              let testWord
              if (i < wordBoundary.length - 1)
                testWord = !regexExp.test(wordBoundary[i+1].privText)
              else
                testWord = true
              return (
                <div className={testWord ? classes.spacedWord : classes.word} style={{ transform: `scale(${scale})` }}>
                  <span>
                    {word.privText}
                  </span>
                </div>
              )
            })
            : replaceBadWords(title)
          }
        </div>
        {!_.isEmpty(linkFlairText) && 
          <div
            className={classes.linkFlair}
            style={{ backgroundColor: _.get(post, 'link_flair_text', '').length === 0 ? linkFlairColor : '#303132' }}>
              {linkFlairText}
          </div>
        }
        {
          over18 && 
          <div className={classes.linkFlair} style={{ backgroundColor: 'red' }}>
              NSFW
          </div>
        }
      </div>
    </>
  )
}

RedditPost.propTypes = {
  post: PropTypes.shape({}).isRequired,
  playbackRate: PropTypes.number,
  isAnimated: PropTypes.bool,
}

RedditPost.defaultProps = {
  isAnimated: false,
  playbackRate: 1.5
}

export default RedditPost;