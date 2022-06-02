import {Composition} from 'remotion';
import CityVideo from './Components/CityVideo';

export const RemotionVideo = () => {

	return (
		<>
			<Composition
				id="GeneratedVideo"
				component={CityVideo}
				durationInFrames={60 * 30}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					titleText: 'Working with TTS (Azure + AWS S3)',
					titleColor: 'black',
				}}
			/>
		</>
	);
};