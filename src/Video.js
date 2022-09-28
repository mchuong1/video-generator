import _ from 'lodash';
import { textToSpeech } from './TextToSpeech';
import { getRedditPost } from './service/service';
import RedditVideo from './Compositions/RedditVideo';
import { useEffect, useState, useCallback } from 'react';
import { removeUrl, findComment, convertAcronyms } from './util/utils';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import { getAudioDurationInSeconds, getVideoMetadata } from '@remotion/media-utils';
import AnimatedRedditVideo from './Compositions/AnimatedRedditVideo';

export const RemotionVideo = () => {
	const props = getInputProps();
	const {
		postId="xpr814",
		commentIds="iq5hmi7,iq5fvf2,iq6lb18,iq7akku,iq683g7,iq6ld10",
		redditVideo="",
		redditAudio="",
		voice="enUSMan1",
		playbackRate=1.5,
		videoStart=216,
		videoUrl=""
	} = props;

	const [handle] = useState(() => delayRender());
	const [post, setPost] = useState({});
	const [selfText, setSelfText] = useState({});
	const [comments, setComments] = useState([]);
	const [videoDuration, setVideoDuration] = useState(1);

	const getAudioUrls = useCallback(async (textArray) => {
		const result = await Promise.all(_.map(textArray, text => typeof text === 'string' ? textToSpeech(text, voice) : getAudioUrls(text)));
		const ttsUrl = _.map(result, r => r.ttsUrl);
		const wordBoundaryUrl = _.map(result, r => r.wordBoundaryUrl);
		return { ttsUrl, wordBoundaryUrl };
	}, [voice]);

	const getAudioDurations = useCallback(async (audioUrls) => {
		const durations = await Promise.all(_.map(audioUrls, url => typeof url === 'string' ? getAudioDurationInSeconds(url) : getAudioDurations(url)));
		return durations;
	}, [])
	
	const fetchData = useCallback(async () => {
		const post = await getRedditPost(postId);
    const { title, selftext } = post;

    const {ttsUrl: postAudioUrl, wordBoundaryUrl: postWordBoundaryUrl } = await textToSpeech(convertAcronyms(title), voice);
    const duration = await getAudioDurationInSeconds(postAudioUrl);
		setPost({...post, postAudioUrl, postAudioDuration: duration, postWordBoundaryUrl});

    if(selftext.length > 0) {
      const noUrlSelfText = removeUrl(selftext);
      const selfTextArray = noUrlSelfText.replace(/([.?!])\s*(?=[a-zA-Z"])/g, "$1|").split("|");
      const filteredSelfTextArray = _.filter(selfTextArray, string => !_.isEmpty(string));
      
      const { ttsUrl: selfTextAudioUrls, wordBoundaryUrl } = await getAudioUrls(filteredSelfTextArray);
      const selfTextAudioDurations = await getAudioDurations(selfTextAudioUrls);
			setSelfText({selfTextArray: filteredSelfTextArray, selfTextAudioUrls, selfTextAudioDurations, selfTextWordBoundaryUrls: wordBoundaryUrl});
    }

		if(commentIds.length > 0) {
			const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
			const parsedComments = _.map(comments, comment => {
				if(_.get(comment, 'body', '').length > 150) {
					const removedUrl = removeUrl(comment.body)
					return {
						...comment,
						bodyArray: removedUrl.replace(/([.?!])\s*(?=[a-zA-Z])/g, "$1|").split("|"),
					}
				}
				return comment;
			});
			const {ttsUrl: commentAudioUrls, wordBoundaryUrl} = await getAudioUrls(_.map(parsedComments, comment => _.get(comment, 'bodyArray', false) ? comment.bodyArray : removeUrl(comment.body)));
			const commentAudioDurations = await getAudioDurations(commentAudioUrls);
			setComments({comments: parsedComments, commentAudioUrls, commentAudioDurations, commentWordBoundaryUrls: wordBoundaryUrl});
		}

		if(redditVideo.length > 0) {
			await getVideoMetadata(redditVideo)
				.then(({ durationInSeconds }) => { setVideoDuration(durationInSeconds) })
				.catch((err) => { console.log(`Error fetching metadata: ${err}`) });
		}
		continueRender(handle);
	}, [handle, postId, commentIds, redditVideo, voice, getAudioUrls, getAudioDurations]);

	const totalDuration = () => {
		const selfTextPlusVideoDuration = Math.ceil((_.sum(_.get(selfText, 'selfTextAudioDurations', [0])) > 1 ? _.sum(_.get(selfText, 'selfTextAudioDurations', [0])) : 0) * 30 / playbackRate) + Math.ceil((videoDuration > 1 ? videoDuration : 0) * 30);
		return Math.ceil(_.sum(_.flatten([_.get(post, 'postAudioDuration', 1), ..._.get(comments, 'commentAudioDurations', [0])])) * 30 / playbackRate + selfTextPlusVideoDuration);
	}
	const totalAnimatedDuration = () => {
		const selfTextPlusVideoDuration = Math.ceil((_.sum(_.get(selfText, 'selfTextAudioDurations', [0])) > 1 ? _.sum(_.get(selfText, 'selfTextAudioDurations', [1])) : 0) * 30 / playbackRate) + Math.ceil((videoDuration > 1 ? videoDuration : 0) * 30);
		const postAudioDuration = _.get(post, 'postAudioDuration', 1) + 0.5;
		const commentAudioDurations = _.map(_.flatten(_.get(comments, 'commentAudioDurations', [0])), duration => duration + 0.5);
		const total = Math.ceil(_.sum(_.flatten([postAudioDuration, ...commentAudioDurations])) * 30 / playbackRate + selfTextPlusVideoDuration);
		return total;
	}

	useEffect(() => {
		fetchData();
	}, [fetchData])

	return (
		<>
			<Composition
				id="RedditVideo"
				component={RedditVideo}
				durationInFrames={totalDuration()}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					post,
					selfText,
					comments,
					redditVideo,
					redditAudio,
					videoDuration,
					playbackRate,
					videoStart,
					videoUrl
				}}
			/>
			<Composition
				id="AnimatedRedditVideo"
				component={AnimatedRedditVideo}
				durationInFrames={totalAnimatedDuration()}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					post,
					selfText,
					comments,
					redditVideo,
					redditAudio,
					videoDuration,
					playbackRate,
					videoStart,
					videoUrl
				}}
			/>
		</>
	);
};