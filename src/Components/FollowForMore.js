import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FollowForMore = () => {

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    from: 0,
    to: 1,
    frame,
  });

	return (
		<>
			<h1
				style={{
					fontFamily: 'SF Pro Text, Helvetica, Arial',
					fontWeight: 'bold',
					fontSize: 100,
					textAlign: 'center',
					bottom: '75rem',
					width: '100%',
          color: 'white',
          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
          alignSelf: 'center'
				}}
			>
        <div style={{ transform: `scale(${scale})` }}>
          Like for Part 2!
        </div>
			</h1>
		</>
	);
};
