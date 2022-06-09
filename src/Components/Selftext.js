import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';

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
  const { text } = props;
  const classes = useStyles();
  return(
    <Paper classes={{ root: classes.paper }}>
      <div className={classes.body}>{text}</div>
    </Paper>
  )
}

export default SelfText;