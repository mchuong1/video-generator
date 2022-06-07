import { useState } from 'react';
import {Composition, getInputProps} from 'remotion';
import CityVideo from './Components/CityVideo';

export const RemotionVideo = () => {

	const props = getInputProps();
	const { postId, comments } = props;
	const mockComments = "fgsj4rg,fgs9v44,fgs5ek3"
	const [duration, setDuration] = useState(60);

	return (
		<>
			<Composition
				id="GeneratedVideo"
				component={CityVideo}
				durationInFrames={240 * 30}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					postId: 'f08dxb',
					commentIds: mockComments,
				}}
			/>
		</>
	);
};