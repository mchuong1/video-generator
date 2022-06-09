import { useEffect, useState, useCallback } from 'react';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import RedditVideo from './Components/RedditVideo';
import { getRedditPost } from './service/service';
import { textToSpeech } from './TextToSpeech';
import _ from 'lodash';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { removeUrl } from './util/utils';

export const RemotionVideo = () => {

	const props = getInputProps();
	const { postId="uzgdw4", commentIds="iab5i95,iab5ztc,iaaj23g,iabxe1y,iaazqyj,iab8f7f" } = props;

	const [handle] = useState(() => delayRender());
  const [duration, setDuration] = useState(1);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1,1,1]);
  const [selfTextAudioDurations, setSelfTextAudioDurations] = useState([1]);

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
    const { title, selftext } = post;

    const postAudioUrl = await textToSpeech(title, 'enUSWoman1');
    const duration = await getAudioDurationInSeconds(postAudioUrl);
		setDuration(duration);

    if(selftext.length > 0) {
      const noUrlSelfText = removeUrl(selftext);
      const selfTextArray = noUrlSelfText.split(/\r?\n/);
      const filteredSelfTextArray = _.filter(selfTextArray, string => !_.isEmpty(string));
      
      const selfTextAudioUrls = await Promise.all(_.map(filteredSelfTextArray, async comment => textToSpeech(comment, 'enUSWoman1')));
      const selfTextAudioDurations = await Promise.all(_.map(selfTextAudioUrls, async urls => getAudioDurationInSeconds(urls)));
      setSelfTextAudioDurations(selfTextAudioDurations);
			console.log(selfTextAudioDurations)
    }

		if(commentIds.length > 0) {
			const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
			const commentAudioUrls = await Promise.all(_.map(comments, async comment => textToSpeech(_.get(comment,'body', ''), 'enUSWoman1')));
			const commentAudioDurations = await Promise.all(_.map(commentAudioUrls, async urls => getAudioDurationInSeconds(urls)));
			setCommentAudioDurations(commentAudioDurations);
		}

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
				durationInFrames={parseInt(_.sum([duration, ...commentAudioDurations, ...selfTextAudioDurations]) * 30 / 1.25,10)}
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