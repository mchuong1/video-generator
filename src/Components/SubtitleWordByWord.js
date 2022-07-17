import {useCallback, useEffect, useState} from 'react';
import {
	continueRender,
	delayRender,
	Sequence,
} from 'remotion';
import _ from 'lodash';

export const SubtitleWordByWord = ({playbackRate, wordBoundaryUrl}) => {

	const [handle] = useState(() => delayRender());
	const [wordBoundary, setWordBoundary] = useState([]);

	const fetchWordBoundary = useCallback(async () => {
		const data = await fetch(wordBoundaryUrl).then(response => response.json());

		// Adding punction values to text
		const punctuation = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length === 0);
		_.map(punctuation, p => {
			const index = _.indexOf(data, p)
			data[index-1].privDuration = data[index-1].privDuration + data[index].privDuration;
			data[index-1].privText = data[index-1].privText + data[index].privText;
		});
		const parsedData = _.filter(data, d => _.replace(d.privText, /[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '').length > 0);

		setWordBoundary(parsedData);

		continueRender(handle);
	}, [handle, wordBoundaryUrl]);

	useEffect(() => {
		fetchWordBoundary();
	}, [fetchWordBoundary]);

	return (
		<>
			<h1
				style={{
					fontFamily: 'SF Pro Text, Helvetica, Arial',
					fontWeight: 'bold',
					fontSize: 100,
					textAlign: 'center',
					position: 'absolute',
					bottom: '75rem',
					width: '100%',
				}}
			>
				{wordBoundary.length > 0 && 
					<>
						{wordBoundary.map((word, i) => {
							const from = Math.round(_.get(word, 'privAudioOffset', 0)/100000*.3/playbackRate);
							const duration = Math.round(_.get(word, 'privDuration', 1)/100000*.3/playbackRate);
							return (
								<Sequence from={from} durationInFrames={duration} name={word.privText}>
									<span
										key={wordBoundary[i]}
										style={{
											color: 'white',
											marginLeft: 10,
											marginRight: 10,
											width: '100%',
											WebkitTextStrokeColor: 'black',
											WebkitTextStrokeWidth: '5px',
											display: 'inline-block',
										}}
									>
										{word.privText}
									</span>
								</Sequence>
							);
						})}
					</>
				}
			</h1>
		</>
	);
};
