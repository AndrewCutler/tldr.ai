import { Readability } from '@mozilla/readability';
import { summarize } from './summarizer';
import { getSiteSummary, setSiteSummary } from './storage';
import { loginfo } from './debug';

let summarizeButton;
let loader;
let summaryElement;
let previousSummary = '';
let redoPopover;

function showLoader() {
	summarizeButton.style.display = 'none';
	summaryElement.style.display = 'none';
	loader.style.display = 'block';
}

function showSummarizeButton() {
	summarizeButton.style.display = 'flex';
	loader.style.display = 'none';
	summaryElement.style.display = 'none';
}

function showSummary(summary) {
	summarizeButton.style.display = 'none';
	loader.style.display = 'none';
	summaryElement.style.display = 'flex';
	summaryElement.children[0].innerText = summary;
}

/**
 * Handles the result of the executed script.
 * @param {InjectionResult} res InjectionResult. See {@link https://developer.chrome.com/docs/extensions/reference/api/scripting#type-InjectionResult}.
 */
async function handle(res, tab) {
	try {
		const [{ result: outerHTML }] = res;
		const document = new DOMParser().parseFromString(
			outerHTML,
			'text/html',
		);
		const { textContent } = new Readability(document).parse();

		const cleaned = textContent
			.replace(/[\r\n\t]/g, '')
			.replace(/\s{2,}/g, '')
			.trim();

		loginfo({ cleaned });

		const summary = await summarize(cleaned);

		loginfo({ summary });

		await setSiteSummary(tab.url, summary);
		showSummary(summary);
	} catch (error) {
		console.error('Error during summarization:', error);
		alert(`Error: ${error.message}`);
	}
}

document.addEventListener('DOMContentLoaded', function () {
	summarizeButton = document.querySelector('#summarize');
	loader = document.querySelector('#loader');
	summaryElement = document.querySelector('#summary');
	redoPopover = document.querySelector('#redo-popover');

	document
		.querySelector('#summarize')
		.addEventListener('click', async function () {
			showLoader();

			chrome.tabs.query(
				{ active: true, lastFocusedWindow: true },
				async function (tabs) {
					const [tab] = tabs;

					if (!tab) throw new Error('no tab');

					const tabSummary = await getSiteSummary(tab.url);

					if (tabSummary) {
						const { summary } = tabSummary;
						previousSummary = summary;
						redoPopover.showPopover();
						return;
					}

					try {
						chrome.scripting
							?.executeScript({
								target: { tabId: tab.id },
								func: function () {
									return document.documentElement.outerHTML;
								},
							})
							.then(function (result) {
								handle(result, tab);
							});
					} catch (error) {
						console.error('Error in main process:', error);
						alert('Error: Failed to process page');
					}
				},
			);
		});

	document.querySelector('#dismiss').addEventListener('click', function () {
		showSummarizeButton();
	});

	document
		.querySelector('#show-previous-button')
		.addEventListener('click', function () {
			showSummary(previousSummary);
			redoPopover.hidePopover();
		});

	document
		.querySelector('#resummarize-button')
		.addEventListener('click', function (event) {
			redoPopover.hidePopover();
		});
});
