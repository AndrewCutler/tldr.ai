export async function getSiteSummary(url) {
	const { [url]: entry } = await chrome.storage.local.get(url);

	return entry;
}

export async function setSiteSummary(url, summary) {
	await chrome.storage.local.set({
		[url]: {
			summary,
			createdAt: Date.now(),
		},
	});
}
