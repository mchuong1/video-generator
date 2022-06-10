import { useEffect, useState, useCallback } from 'react';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import RedditVideo from './Components/RedditVideo';
import { getRedditPost } from './service/service';
import { textToSpeech } from './TextToSpeech';
import _ from 'lodash';
import { getAudioDurationInSeconds, getVideoMetadata } from '@remotion/media-utils';
import { removeUrl } from './util/utils';

export const RemotionVideo = () => {

	const props = getInputProps();
	const { postId="uoi62o", commentIds="i8f48l9,i8fa3ac,i8fgvuv,i8gus5o,i8geoc8,i8fqm1r,i8g1448,i8euyzt,i8ezyqd,i8fqjiw", redditVideo="" } = props;

	const [handle] = useState(() => delayRender());
	const [post, setPost] = useState({});
	const [postAudioUrl, setPostAudioUrl] = useState('');
  const [postAudioDuration, setPostAudioDuration] = useState(1);
	const [selfTextArray, setSelfTextArray] = useState([]);
	const [selfTextAudioUrls, setSelfTextAudioUrls] = useState([]);
  const [selfTextAudioDurations, setSelfTextAudioDurations] = useState([1]);
	const [comments, setComments] = useState([]);
	const [commentAudioUrls, setCommentAudioUrls] = useState([]);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1,1,1]);
	const [videoDuration, setVideoDuration] = useState(1);

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

    const postAudioUrl = await textToSpeech(title, 'enUSMan1');
    const duration = await getAudioDurationInSeconds(postAudioUrl);
		setPost(post);
		setPostAudioUrl(postAudioUrl);
		setPostAudioDuration(duration);

    if(selftext.length > 0) {
      const noUrlSelfText = removeUrl(selftext);
      const selfTextArray = noUrlSelfText.split(/\r?\n/);
      const filteredSelfTextArray = _.filter(selfTextArray, string => !_.isEmpty(string));
      
      const selfTextAudioUrls = await Promise.all(_.map(filteredSelfTextArray, async comment => textToSpeech(comment, 'enUSMan1')));
      const selfTextAudioDurations = await Promise.all(_.map(selfTextAudioUrls, async urls => getAudioDurationInSeconds(urls)));
			setSelfTextArray(filteredSelfTextArray);
			setSelfTextAudioUrls(selfTextAudioUrls);
      setSelfTextAudioDurations(selfTextAudioDurations);
    }

		if(commentIds.length > 0) {
			const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
			const commentAudioUrls = await Promise.all(_.map(comments, async comment => textToSpeech(_.get(comment,'body', ''), 'enUSMan1')));
			const commentAudioDurations = await Promise.all(_.map(commentAudioUrls, async urls => getAudioDurationInSeconds(urls)));
			setComments(comments);
			setCommentAudioUrls(commentAudioUrls);
			setCommentAudioDurations(commentAudioDurations);
		}

		if(redditVideo !== "") {
			getVideoMetadata(redditVideo)
				.then(({ durationInSeconds }) => {
					setVideoDuration(durationInSeconds);
				})
				.catch((err) => {
					console.log(`Error fetching metadata: ${err}`);
				});
		}
		continueRender(handle);
	}, [handle, postId, commentIds, findComment, redditVideo]);

	const totalDuration = () => {
		console.log(videoDuration/2)
		console.log(_.sum([postAudioDuration, ...commentAudioDurations, ...selfTextAudioDurations]) /1.25);
		return Math.round(_.sum([postAudioDuration, ...commentAudioDurations, ...selfTextAudioDurations]) * 30 / 1.25);
	}

	useEffect(() => {
		fetchData();
	}, [fetchData])

	return (
		<>
			<Composition
				id="GeneratedVideo"
				component={RedditVideo}
				durationInFrames={totalDuration()}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					post,
					postId,
					postAudioUrl,
					postAudioDuration,
					selfTextArray,
					selfTextAudioUrls,
					selfTextAudioDurations,
					comments,
					commentIds,
					commentAudioUrls,
					commentAudioDurations,
					redditVideo,
				}}
			/>
		</>
	);
};