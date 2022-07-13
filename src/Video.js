import { useEffect, useState, useCallback } from 'react';
import {Composition, continueRender, getInputProps, delayRender} from 'remotion';
import RedditVideo from './Components/RedditVideo';
import { getRedditPost } from './service/service';
import { textToSpeech } from './TextToSpeech';
import _ from 'lodash';
import { getAudioDurationInSeconds, getVideoMetadata } from '@remotion/media-utils';
import { removeUrl, findComment, replaceBadWords } from './util/utils';

export const RemotionVideo = () => {

	const props = getInputProps();
	const {
		postId="voxgri",
		commentIds="iefviwb,iefrf4n,iefzp3v,iefrg5y,iefqvo8,iefsaga,iefpzw2,iefnwic,iefo0w5,iegfvpt,iegfvjz,iegc9jb",
		redditVideo="",
		redditAudio="",
		voice="enUSMan1",
		playbackRate=1.25,
		videoStart=686,
	} = props;

	const [handle] = useState(() => delayRender());
	const [post, setPost] = useState({});
	const [postAudioUrl, setPostAudioUrl] = useState('');
  const [postAudioDuration, setPostAudioDuration] = useState(1);
	const [postWordBoundaryUrl, setPostWordBoundaryUrl] = useState('');
	const [selfTextArray, setSelfTextArray] = useState([]);
	const [selfTextAudioUrls, setSelfTextAudioUrls] = useState([]);
  const [selfTextAudioDurations, setSelfTextAudioDurations] = useState([1]);
	const [selfTextWordBoundaryUrls, setSelfTextWordBoundaryUrls] = useState([]);
	const [comments, setComments] = useState([]);
	const [commentAudioUrls, setCommentAudioUrls] = useState([]);
  const [commentAudioDurations, setCommentAudioDurations] = useState([1]);
	const [commentWordBoundaryUrls, setCommentWordBoundaryUrls] = useState([]);
	const [videoDuration, setVideoDuration] = useState(1);

	const getAudioUrls = useCallback(async (textArray) => {
		const result = await Promise.all(_.map(textArray, text => typeof text === 'string' ? textToSpeech(replaceBadWords(text), voice) : getAudioUrls(text)));
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

    const {ttsUrl: postAudioUrl, wordBoundaryUrl: postWordBoundaryUrl } = await textToSpeech(replaceBadWords(title), voice);
    const duration = await getAudioDurationInSeconds(postAudioUrl);
		setPost(post);
		setPostAudioUrl(postAudioUrl);
		setPostAudioDuration(duration);
		setPostWordBoundaryUrl(postWordBoundaryUrl);

    if(selftext.length > 0) {
      const noUrlSelfText = removeUrl(selftext);
      const selfTextArray = noUrlSelfText.replace(/([.?!])\s*(?=[a-zA-Z])/g, "$1|").split("|");
      const filteredSelfTextArray = _.filter(selfTextArray, string => !_.isEmpty(string));
      
      const { ttsUrl: selfTextAudioUrls, wordBoundaryUrl } = await getAudioUrls(filteredSelfTextArray);
      const selfTextAudioDurations = await getAudioDurations(selfTextAudioUrls);
			setSelfTextArray(filteredSelfTextArray);
			setSelfTextAudioUrls(selfTextAudioUrls);
      setSelfTextAudioDurations(selfTextAudioDurations);
			setSelfTextWordBoundaryUrls(wordBoundaryUrl);
    }

		if(commentIds.length > 0) {
			const comments = _.map(commentIds.split(','), id => findComment(id, post.comments));
			const parsedComments = _.map(comments, comment => {
				if(_.get(comment, 'body', '').length > 150) {
					const removedUrl = replaceBadWords(removeUrl(comment.body))
					return {
						...comment,
						bodyArray: removedUrl.replace(/([.?!])\s*(?=[a-zA-Z])/g, "$1|").split("|"),
					}
				}
				return comment;
			});
			const {ttsUrl: commentAudioUrls, wordBoundaryUrl} = await getAudioUrls(_.map(parsedComments, comment => _.get(comment, 'bodyArray', false) ? comment.bodyArray : comment.body));
			const commentAudioDurations = await getAudioDurations(commentAudioUrls);
			setComments(parsedComments);
			setCommentAudioUrls(commentAudioUrls);
			setCommentAudioDurations(commentAudioDurations);
			setCommentWordBoundaryUrls(wordBoundaryUrl);
		}

		if(redditVideo.length > 0) {
			await getVideoMetadata(redditVideo)
				.then(({ durationInSeconds }) => { setVideoDuration(durationInSeconds) })
				.catch((err) => { console.log(`Error fetching metadata: ${err}`) });
		}
		continueRender(handle);
	}, [handle, postId, commentIds, redditVideo, voice, getAudioUrls, getAudioDurations]);

	const totalDuration = () => {
		const selfTextPlusVideoDuration = Math.ceil((_.sum(selfTextAudioDurations) > 1 ? _.sum(selfTextAudioDurations) : 0) * 30 / playbackRate) + Math.ceil((videoDuration > 1 ? videoDuration : 0) * 30);
		return Math.ceil(_.sum(_.flatten([postAudioDuration, ...commentAudioDurations])) * 30 / playbackRate + selfTextPlusVideoDuration);
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
					postWordBoundaryUrl,
					selfTextArray,
					selfTextAudioUrls,
					selfTextAudioDurations,
					selfTextWordBoundaryUrls,
					comments,
					commentIds,
					commentAudioUrls,
					commentAudioDurations,
					commentWordBoundaryUrls,
					redditVideo,
					redditAudio,
					videoDuration,
					playbackRate,
					videoStart
				}}
			/>
		</>
	);
};