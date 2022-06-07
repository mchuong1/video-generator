import { Paper } from '@mui/material';
import PropTypes from 'prop-types'
import { getSubredditIcon } from '../service/service';
import _ from 'lodash';
import moment from 'moment';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useState } from 'react';
import { continueRender, delayRender, Img } from 'remotion';

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
    width: '1080px'
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
    marginBottom: '5px'
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
  }
}))

const RedditPost = (props) => {
  const { post } = props;
  const classes = useStyles();
  const [handle] = useState(() => delayRender());
  const [communityIcon, setCommunityIcon] = useState('');

  const {
    title, author,
    subreddit, created,
    link_flair_text: linkFlairText,
    link_flair_background_color: linkFlairColor,
    subreddit_name_prefixed: subredditPrefixed,
    all_awardings: allAwards,
  } = post
  console.log(allAwards)
  const fetchData = useCallback(async() => {
    const data = await getSubredditIcon(subreddit.display_name);

    setCommunityIcon(data);

    continueRender(handle);
  }, [handle, subreddit])

  useEffect(() => {
    fetchData();
  },[fetchData])

  return (
    <>
      <Paper classes={{ root: classes.paper }}>
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
              <Img key={award.name} className={classes.award} src={award.resized_icons[1].url} alt={award.name}/>
              {award.count > 1 && <span key={i} className={classes.awardcount}>{award.count}</span>}
            </>
          ))}
        </div>
        }
        <div className={classes.title}>{title}</div>
        {!_.isEmpty(linkFlairText) && 
          <div
            className={classes.linkFlair}
            style={{ backgroundColor: linkFlairColor.length === 0 ? linkFlairColor : '#303132' }}>
              {linkFlairText}
          </div>
        }
      </Paper>
    </>
  )
}

RedditPost.propTypes = {
  post: PropTypes.shape({}).isRequired,
}

export default RedditPost;