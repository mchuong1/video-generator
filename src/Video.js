import { useEffect, useState, useCallback } from 'react';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import RedditVideo from './Components/RedditVideo';
import { getRedditPost } from './service/service';
import { textToSpeech } from './TextToSpeech';
import _ from 'lodash';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const RemotionVideo = () => {

	const props = getInputProps();
	const { postId, commentIds } = props;

	const [handle] = useState(() => delayRender());
  const [duration, setDuration] = useState(1);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1,1,1]);
	
	const findComment = useCallback((id, collection, index = 0, depth = 1) => {
    // Test other edge cases. This worked because the first depth index had your answer
    if(_.find(collection, {id})) return _.find(collection, {id});
    if(_.get(collection[index], 'replies', []).length > 0) return findComment(id, collection[index].replies);
    return undefined;
  }, []);
	
	const fetchData = useCallback(async () => {
		const post = await getRedditPost(postId);
    const { title } = post;
    const fileName = await textToSpeech(title, 'enUSWoman1');
    const duration = await getAudioDurationInSeconds(fileName);

    const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
    const commentAudioUrls = await Promise.all(_.map(comments, async comment => textToSpeech(comment.body, 'enUSWoman1')));
    const commentAudioDurations = await Promise.all(_.map(commentAudioUrls, async urls => getAudioDurationInSeconds(urls)));

    setDuration(duration);
    setCommentAudioDurations(commentAudioDurations);

		continueRender(handle);
	}, [handle, postId, commentIds, findComment]);

	useEffect(() => {
		fetchData();
	}, [fetchData])

	return (
		<>
			<Composition
				id="GeneratedVideo"
				component={RedditVideo}
				durationInFrames={parseInt(_.sum([duration, ...commentAudioDurations]) * 30,10)}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					postId,
					commentIds,
				}}
			/>
		</>
	);
};