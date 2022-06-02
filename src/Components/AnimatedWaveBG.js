import { makeStyles } from "@mui/styles";
import PropTypes from 'prop-types';
import { AbsoluteFill } from "remotion";

const useStyles = makeStyles(() => ({
  header: {
    position: 'relative',
    background: 'linear-gradient(60deg, rgba(84,58,183,1) 0%, rgba(0,172,193,1) 100%)',
    color: 'white',
    textAlign: 'center'
  },
  innerHeader: {
    height: '65vh',
    width: '100%',
    margin: 0,
    padding: 0
  },
  content: {
    position: 'relative',
    height: '20vh',
    textAlign: 'center',
    backgroundColor: 'white'
  },
  waves: {
    position:'relative',
    width:'100%',
    height:'15vh',
    marginBottom:'-7px',
    minHeight:'100px',
    maxHeight:'150px',
    // [theme.breakpoints.up('sm')]: {
    //   height: '40px',
    //   minHeight: '40px'
    // }
  },
  parallax: {
    animation: 'move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite'
  },
  "parallax > use": {
    animation: 'move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite'
  },
  "parallax > use:nth-child(1)":{
    animationDelay: '-2s',
    animationDuration: '7s',
  },
  "parallax > use:nth-child(2)":{
    animationDelay: '-3s',
    animationDuration: '10s',
  },
  "parallax > use:nth-child(3)":{
    animationDelay: '-4s',
    animationDuration: '13s',
  },
  "parallax > use:nth-child(4)":{
    animationDelay: '-5s',
    animationDuration: '20s',
  },
  "@keyframes move-forever": {
    "0%": {
      transform: "translate3d(-90px,0,0)",
    },
    "100%": {
      transform: "translate3d(-85px,0,0)",
    }
  },
}));

const AnimatedWaveBG = (props) => {
  const { children, footers } = props;
  const classes = useStyles();

  return (
    <AbsoluteFill>
      <div className={classes.header}>
      <div className={classes.innerHeader}>
        {...children}
        <h1>Test</h1>
      </div>

      <div>
        <svg className={classes.waves} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className={classes.parallax}>
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
          </g>
        </svg>
      </div>

      </div>
      <div className={classes.content}>
        {...footers}
      </div>
    </AbsoluteFill>
  )
}

AnimatedWaveBG.propTypes = {
  children: PropTypes.arrayOf({}).isRequired,
  footers: PropTypes.arrayOf({}).isRequired,
};

export default AnimatedWaveBG;