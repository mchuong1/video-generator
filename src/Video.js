import { useEffect, useState, useCallback } from 'react';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import RedditVideo from './Components/RedditVideo';
import { getRedditPost } from './service/service';
import { textToSpeech } from './TextToSpeech';
import _ from 'lodash';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const RemotionVideo = () => {

	const props = getInputProps();
	const { postId="uzgdw4", commentIds="iab5i95,iab5ztc,iaaj23g,iabxe1y,iaazqyj,iab8f7f" } = props;

	const [handle] = useState(() => delayRender());
  const [duration, setDuration] = useState(1);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1,1,1]);
	
  const findComment = useCallback((id, collection) => {
    if(collection.length === 0) return undefined;
    if(_.find(collection, {id})) return _.find(collection, {id});
    for(let i = 0; i < collection.length; i++) {
      if(_.get(collection[i], 'replies', []).length > 0) {
        if(_.find(collection[i].replies, {id})) return _.find(collection[i].replies, {id})
      }
    }
    const newCollection = _.map(collection, listing => {
      return listing.replies;
    });
    return findComment(id, _.flattenDeep(newCollection));
  }, []);
	
	const fetchData = useCallback(async () => {
		const post = await getRedditPost(postId);
    const { title } = post;
    const fileName = await textToSpeech(title, 'enUSWoman1');
    const duration = await getAudioDurationInSeconds(fileName);

    const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
    const commentAudioUrls = await Promise.all(_.map(comments, async comment => textToSpeech(_.get(comment,'body', ''), 'enUSWoman1')));
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