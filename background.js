import { summarize } from './summarizer';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	(async () => {
		const summary = await summarize(message);
		sendResponse({ summary });
	})();

	return true;
});
