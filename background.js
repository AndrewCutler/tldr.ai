import { summarize } from './summarizer';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if ('type' in message === false) {
		throw new Error('all messages must have a type');
	}

	if (message.type === 'summarize') {
		(async () => {
			const summary = await summarize(message.data);
			sendResponse({ summary });
		})();

		return true;
	}

	if (message.type === 'github') {
		chrome.tabs.create({ url: 'https://github.com/AndrewCutler/tldr.ai' });
	}

	console.warn('unhandled message:', message);
});
