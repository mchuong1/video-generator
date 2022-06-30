import { useEffect, useState, useCallback } from 'react';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import RedditVideo from './Components/RedditVideo';
import { getRedditPost } from './service/service';
import { textToSpeech } from './TextToSpeech';
import _ from 'lodash';
import { getAudioDurationInSeconds, getVideoMetadata } from '@remotion/media-utils';
import { removeUrl, findComment } from './util/utils';

export const RemotionVideo = () => {

	const props = getInputProps();
	const {
		postId="oe5uja",
		commentIds="h456yxy,h451286,h44wn3y",
		redditVideo="",
		redditAudio="",
		voice="enUSMan1",
	} = props;

	const [handle] = useState(() => delayRender());
	const [post, setPost] = useState({});
	const [postAudioUrl, setPostAudioUrl] = useState('');
  const [postAudioDuration, setPostAudioDuration] = useState(1);
	const [selfTextArray, setSelfTextArray] = useState([]);
	const [selfTextAudioUrls, setSelfTextAudioUrls] = useState([]);
  const [selfTextAudioDurations, setSelfTextAudioDurations] = useState([1]);
	const [comments, setComments] = useState([]);
	const [commentAudioUrls, setCommentAudioUrls] = useState([]);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1]);
	const [videoDuration, setVideoDuration] = useState(1);

	const getAudioUrls = useCallback(async (textArray) => {
		const urls = await Promise.all(_.map(textArray, text => typeof text === 'string' ? textToSpeech(text, voice) : getAudioUrls(text)));
		return urls;
	}, [voice]);

	const getAudioDurations = useCallback(async (audioUrls) => {
		const durations = await Promise.all(_.map(audioUrls, url => typeof url === 'string' ? getAudioDurationInSeconds(url) : getAudioDurations(url)));
		return durations;
	}, [])
	
	const fetchData = useCallback(async () => {
		const post = await getRedditPost(postId);
    const { title, selftext } = post;

    const postAudioUrl = await textToSpeech(title, voice);
    const duration = await getAudioDurationInSeconds(postAudioUrl);
		setPost(post);
		setPostAudioUrl(postAudioUrl);
		setPostAudioDuration(duration);

    if(selftext.length > 0) {
      const noUrlSelfText = removeUrl(selftext);
      const selfTextArray = noUrlSelfText.split(/\r?\n/);
      const filteredSelfTextArray = _.filter(selfTextArray, string => !_.isEmpty(string));
      
      const selfTextAudioUrls = await getAudioUrls(filteredSelfTextArray);
      const selfTextAudioDurations = await getAudioDurations(selfTextAudioUrls);
			setSelfTextArray(filteredSelfTextArray);
			setSelfTextAudioUrls(selfTextAudioUrls);
      setSelfTextAudioDurations(selfTextAudioDurations);
    }

		if(commentIds.length > 0) {
			const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
			const parsedComments = _.map(comments, comment => {
				if(_.get(comment, 'body', '').length > 300) {
					const removedUrl = removeUrl(comment.body)
					return {
						...comment,
						bodyArray: removedUrl.replace(/([.?!])\s*(?=[a-zA-Z])/g, "$1|").split("|"),
					}
				}
				return comment;
			});
			const commentAudioUrls = await getAudioUrls(_.map(parsedComments, comment => _.get(comment, 'bodyArray', false) ? comment.bodyArray : comment.body));
			const commentAudioDurations = await getAudioDurations(commentAudioUrls);
			setComments(parsedComments);
			setCommentAudioUrls(commentAudioUrls);
			setCommentAudioDurations(commentAudioDurations);
		}

		if(redditVideo.length > 0) {
			await getVideoMetadata(redditVideo)
				.then(({ durationInSeconds }) => { setVideoDuration(durationInSeconds) })
				.catch((err) => { console.log(`Error fetching metadata: ${err}`) });
		}
		continueRender(handle);
	}, [handle, postId, commentIds, redditVideo, voice, getAudioUrls, getAudioDurations]);

	const totalDuration = () => {
		const selfTextPlusVideoDuration = Math.ceil((_.sum(selfTextAudioDurations) > 1 ? _.sum(selfTextAudioDurations) : 0) * 30 / 1.25) + Math.ceil((videoDuration > 1 ? videoDuration : 0) * 30);
		return Math.ceil(_.sum(_.flatten([postAudioDuration, ...commentAudioDurations])) * 30 / 1.25 + selfTextPlusVideoDuration);
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
					redditAudio,
					videoDuration,
				}}
			/>
		</>
	);
};