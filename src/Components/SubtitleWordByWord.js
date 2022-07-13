import {useCallback, useEffect, useState} from 'react';
import {
	continueRender,
	delayRender,
	Sequence,
} from 'remotion';
import _ from 'lodash';

export const SubtitleWordByWord = ({subtitle, playbackRate, wordBoundaryUrl}) => {
	const text = _.split(subtitle, ' ')

	const [handle] = useState(() => delayRender());
	const [wordBoundary, setWordBoundary] = useState([]);
	const [textArray, setTextArray] = useState([]);

	function isNumeric(str) {
		if (typeof str !== "string") return false // We only process strings!  
		return !isNaN(str) && // Use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
					 !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
	}

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

		// Adding numbers to text
		// const numberText = _.filter(text, t => !isNaN(parseInt(_.replace(t,/[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, ''), 10)));
		// _.map(numberText, p => {
		// 	const index = _.indexOf(text, p);
		// 	text[index+1] = text[index] + " " + text[index + 1]
		// });
		// const parsedText = _.filter(text, t => !isNumeric(_.replace(t,/[!"'#$%&()*+,-./:;<=>?@[\]^_`{|}~]/g, '')));

		setTextArray(text);
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
					bottom: 160,
					width: '100%',
				}}
			>
				{wordBoundary.length > 0 && 
					<>
						{textArray.map((t, i) => {
							const from = Math.round(_.get(wordBoundary[i], 'privAudioOffset', 0)/100000*.3/playbackRate);
							const duration = Math.round(_.get(wordBoundary[i], 'privDuration', 1)/100000*.3/playbackRate);
							return (
								<Sequence from={from} durationInFrames={duration} name={t}>
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
										{t}
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
