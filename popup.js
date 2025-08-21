import { Readability } from '@mozilla/readability';
import { summarize } from './summarizer';

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#tldr').addEventListener('click', function (event) {
		// Show loading state
		const button = event.target;
		const originalText = button.textContent;
		button.textContent = 'Loading...';
		button.disabled = true;

		chrome.tabs.query(
			{ active: true, lastFocusedWindow: true },
			async function (tabs) {
				function getDocument() {
					return document.documentElement.outerHTML;
				}

				try {
					chrome.scripting
						?.executeScript({
							target: { tabId: tabs[0].id },
							func: getDocument,
						})
						.then(async function ([res]) {
							try {
								const { result: outerHTML } = res;
								const document =
									new DOMParser().parseFromString(
										outerHTML,
										'text/html',
									);
								const { textContent } = new Readability(
									document,
								).parse();

								console.log(
									'Extracted text length:',
									textContent.length,
								);

								const summary = await summarize(textContent);
								// const summary = await summarize(testText);

								alert(`Summary: ${summary}`);
							} catch (error) {
								console.error(
									'Error during summarization:',
									error,
								);
								alert(`Error: ${error.message}`);
							} finally {
								// Reset button state
								button.textContent = originalText;
								button.disabled = false;
							}
						})
						.catch(function (error) {
							console.error('Error executing script:', error);
							alert('Error: Failed to extract page content');
							button.textContent = originalText;
							button.disabled = false;
						});
				} catch (error) {
					console.error('Error in main process:', error);
					alert('Error: Failed to process page');
					button.textContent = originalText;
					button.disabled = false;
				}
			},
		);
	});
});
