/// <reference types="chrome"/>

import { Readability } from '@mozilla/readability';
import { getSiteSummary, setSiteSummary } from './storage';

let summarizeButton;
let loader;
let summaryElement;
let previousSummary = '';
let redoPopover;

class UI {
	static showLoader() {
		summarizeButton.style.display = 'none';
		summaryElement.style.display = 'none';
		loader.style.display = 'block';
	}

	static showSummarizeButton() {
		summarizeButton.style.display = 'flex';
		loader.style.display = 'none';
		summaryElement.style.display = 'none';
	}

	static showSummary(summary) {
		summarizeButton.style.display = 'none';
		loader.style.display = 'none';
		summaryElement.style.display = 'flex';
		summaryElement.children[0].innerText = summary;
	}

	static showPopover() {
		redoPopover.showPopover();
	}

	static hidePopover() {
		redoPopover.hidePopover();
	}
}

// TODO: this has to happen in a background service so it's not lost if popup is closed.
/**
 * Handles the result of the executed script.
 * @param {InjectionResult} res InjectionResult. See {@link https://developer.chrome.com/docs/extensions/reference/api/scripting#type-InjectionResult}.
 */
async function handleDocument(res, tab) {
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

		chrome.runtime.sendMessage(
			{ data: cleaned, type: 'summarize' },
			async function ({ summary }) {
				await setSiteSummary(tab.url, summary);
				UI.showSummary(summary);
			},
		);
	} catch (error) {
		console.error('Error during summarization:', error);
		alert(`Error: ${error.message}`);
	}
}

function buildSummary(skipPrevious) {
	UI.showLoader();

	chrome.tabs.query(
		{ active: true, lastFocusedWindow: true },
		async function (tabs) {
			const [tab] = tabs;

			if (!tab) throw new Error('no tab');

			const tabSummary = await getSiteSummary(tab.url);

			if (!skipPrevious && tabSummary) {
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
						handleDocument(result, tab);
					});
			} catch (error) {
				console.error('Error in main process:', error);
				alert('Error: Failed to process page');
			}
		},
	);
}

function registerEventListeners() {
	summarizeButton = document.querySelector('#summarize');
	loader = document.querySelector('#loader');
	summaryElement = document.querySelector('#summary');
	redoPopover = document.querySelector('#redo-popover');

	summarizeButton.addEventListener('click', function () {
		buildSummary();
	});

	document.querySelector('#dismiss').addEventListener('click', function () {
		UI.showSummarizeButton();
	});

	document
		.querySelector('#show-previous-button')
		.addEventListener('click', function () {
			UI.showSummary(previousSummary);
			UI.hidePopover();
		});

	document
		.querySelector('#resummarize-button')
		.addEventListener('click', function () {
			UI.hidePopover();
			buildSummary(true);
		});

	document.querySelector('#github').addEventListener('click', function () {
		chrome.runtime.sendMessage({ type: 'github' });
	});

	document.querySelector('#help').addEventListener('click', function () {
		throw new Error('not implemented');
	});
}

document.addEventListener('DOMContentLoaded', function () {
	registerEventListeners();
});
