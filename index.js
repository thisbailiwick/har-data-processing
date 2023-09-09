let fs = null;
let createCsvWriter = null;
let filePath = null;
let fileName = null;

const readFile = (filePath) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				console.error('An error occurred while reading the HAR file.');
				reject(err);
			}
			resolve(JSON.parse(data));
		});
	});
};

const getInitiatorStack = (entry) => {
	if (entry._initiator.type === 'script' || entry._initiator.type === 'parser') {
		return entry._initiator.stack
			? entry._initiator.stack.callFrames.map(
				(callFrame) => `${callFrame.url} line ${callFrame.lineNumber} column ${callFrame.columnNumber}`
			).join('\n')
			: `${entry._initiator.url} line ${entry._initiator.lineNumber}`;
	}
};

const getJsFiles = (entries) => {
	return entries
		.filter((entry) => entry.request.url.endsWith('.js') || entry.request.url.endsWith('.mjs'))
		.map((entry) => ({
			url: entry.request.url,
			initiatorStack: getInitiatorStack(entry),
			wait: entry.timings.wait,
			downloading: entry.timings.receive,
			totalWaitReceive: entry.timings.wait + entry.timings.receive,
			total: entry.time,
		}));
};

const writeCsvFile = (filename, records) => {
	const csvWriter = createCsvWriter({
		path: filename + '.csv',
		header: [
			{ id: 'url', title: 'URL' },
			{ id: 'initiatorStack', title: 'Initiator Stack' },
			{ id: 'wait', title: 'Wait for server response' },
			{ id: 'downloading', title: 'Downloading from server' },
			{ id: 'totalWaitReceive', title: 'Total Wait and Downloading' },
			{ id: 'total', title: 'Total' },
		],
	});
	return csvWriter.writeRecords(records);
};

module.exports = {
    readFile,
    getJsFiles,
    writeCsvFile
}

// This condition checks to see if this script is the main module (i.e., not being imported)
if (require.main === module) {
	fs = require('fs');
	createCsvWriter = require('csv-writer').createObjectCsvWriter;
	filePath = process.argv[3];
	fileName = filePath.split('/').pop();

	readFile(filePath)
	.then((harData) => getJsFiles(harData.log.entries))
	.then((jsFiles) => writeCsvFile(fileName, jsFiles))
	.then(() => console.log('...Done'))
	.catch((error) => console.log(error));
}