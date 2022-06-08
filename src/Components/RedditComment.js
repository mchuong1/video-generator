import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { getRedditUserIcon } from '../service/service';
import { continueRender, delayRender, Img } from 'remotion';

const useStyles = makeStyles(() => ({
  paper: {
    marginBottom: '10px',
    backgroundColor: '#1A1A1B !important',
    color: '#D7DADC !important',
    padding: '50px',
    textAlign: 'start',
    zIndex: 5,
    position: 'absolute',
    top: '48rem',
    width: '1080px',
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
    fontWeight: 400,
    fontSize: '28px',
    lineHeight: '42px'
  }
}));

const RedditComment = (props) => {
  const { comment } = props;
  const classes = useStyles(props);
  const {
    author, body, created,
    all_awardings: allAwards,
  } = comment;

  const [handle] = useState(() => delayRender());
  const [userIcon, setUserIcon] = useState('');

  const fetchData = useCallback(async() => {
    const data = await getRedditUserIcon(author.name);
    setUserIcon(data)

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
        <div className={classes.body}>{body}</div>
      </Paper>
    </>
  )
};

RedditComment.propTypes = {
  comment: PropTypes.shape({}).isRequired,
};

export default RedditComment;