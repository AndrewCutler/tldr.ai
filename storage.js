export async function getSiteSummary(url) {
	const value = await chrome.storage.local.get(url);

	if (!value[url]) {
		console.log('key not found');
		return;
	}

	return value;
}

export async function setSiteSummary(url, summary) {
	await chrome.storage.local.set({
		[url]: {
			summary,
			createdAt: new Date().getTime(),
		},
	});
}
