import {GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import md5 from 'md5';
import {
	SpeechConfig,
	SpeechSynthesisResult,
	SpeechSynthesizer,
	SpeechSynthesisWordBoundaryEventArgs
} from 'microsoft-cognitiveservices-speech-sdk';

const voices = {
	ptBRWoman: 'pt-BR-FranciscaNeural',
	ptBRMan: 'pt-BR-AntonioNeural',
	enUSWoman1: 'en-US-JennyNeural',
	enUSWoman2: 'en-US-AriaNeural',
	enUSMan1: 'en-US-ChristopherNeural'
} as const;

export const textToSpeech = async (
	text: string,
	voice: keyof typeof voices
): Promise<{ttsUrl: string, wordBoundaryUrl: string}> => {
	const speechConfig = SpeechConfig.fromSubscription(
		process.env.REMOTION_AZURE_TTS_KEY || '',
		process.env.REMOTION_AZURE_TTS_REGION || ''
	);

	if (!voices[voice]) {
		throw new Error('Voice not found');
	}

	const fileName = `${md5(text)}.mp3`;
	const wordBoundaryFile = fileName.replace('.mp3', '');

	const fileExists = await checkIfAudioHasAlreadyBeenSynthesized(fileName);

	if (fileExists) {
		return {
			ttsUrl: createS3Url(fileName),
			wordBoundaryUrl: createS3Url(wordBoundaryFile)
		};
	}

	const synthesizer = new SpeechSynthesizer(speechConfig);

	const ssml = `
                <speak version="1.0" xml:lang="en-US">
                    <voice name="${voices[voice]}">
                        <break time="100ms" /> ${text}
                    </voice>
                </speak>`;

	const wordBoundary: SpeechSynthesisWordBoundaryEventArgs[] = []
	const result = await new Promise<SpeechSynthesisResult>(
		(resolve, reject) => {
			synthesizer.speakSsmlAsync(
				ssml,
				(res) => {
					resolve(res);
				},
				(error) => {
					reject(error);
					synthesizer.close();
				}
			);
			synthesizer.wordBoundary = function (s, e) {
				wordBoundary.push(e);
			};
		}
	);
	const {audioData} = result;

	synthesizer.close();

	await uploadTtsToS3(audioData, fileName);
	await uploadToS3(wordBoundary, wordBoundaryFile);

	return {
		ttsUrl: createS3Url(fileName),
		wordBoundaryUrl: createS3Url(wordBoundaryFile)
	};
};

const checkIfAudioHasAlreadyBeenSynthesized = async (fileName: string) => {
	const bucketName = process.env.REMOTION_AWS_S3_BUCKET_NAME;
	const awsRegion = process.env.REMOTION_AWS_S3_REGION;
	const s3 = new S3Client({
		region: awsRegion,
		credentials: {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY || '',
		},
	});

	try {
		return await s3.send(
			new GetObjectCommand({Bucket: bucketName, Key: fileName})
		);
	} catch {
		return false;
	}
};

const uploadTtsToS3 = async (audioData: ArrayBuffer, fileName: string) => {
	const bucketName = process.env.REMOTION_AWS_S3_BUCKET_NAME;
	const awsRegion = process.env.REMOTION_AWS_S3_REGION;
	const s3 = new S3Client({
		region: awsRegion,
		credentials: {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY || '',
		},
	});

	return s3.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: fileName,
			Body: new Uint8Array(audioData),
		})
	);
};

const uploadToS3 = async (wordBoundary: Array<SpeechSynthesisWordBoundaryEventArgs>, fileName: string) => {
	const bucketName = process.env.REMOTION_AWS_S3_BUCKET_NAME;
	const awsRegion = process.env.REMOTION_AWS_S3_REGION;
	const s3 = new S3Client({
		region: awsRegion,
		credentials: {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY || '',
		},
	});

	return s3.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: fileName,
			Body: JSON.stringify(wordBoundary),
		})
	);
}

const createS3Url = (filename: string) => {
	const bucketName = process.env.REMOTION_AWS_S3_BUCKET_NAME;

	return `https://${bucketName}.s3.amazonaws.com/${filename}`;
};
