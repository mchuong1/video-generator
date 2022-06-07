import {Composition, getInputProps} from 'remotion';
import CityVideo from './Components/CityVideo';

export const RemotionVideo = () => {

	const props = getInputProps();
	const { postId } = props;

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
					postId: 'f08dxb'
				}}
			/>
		</>
	);
};