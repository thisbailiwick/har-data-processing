function addRecords(jsFiles) {
	let records = [];

	jsFiles.forEach(jsFile => {
		console.log(jsFile);
		records.push(
			{
				url: jsFile.url,
				initiatorStack: jsFile.initiatorStack,
				wait: jsFile.timings.wait,
				downloading: jsFile.timings.downloading,
				totalWaitReceive: jsFile.timings.totalWaitReceive,
				total: jsFile.timings.total
			}
		);
	});
	return records;
}

function prepareCsvAndHeaders(fileName) {
	const csvWriter = require('csv-writer').createObjectCsvWriter({
		path: fileName + '.csv',
		header: [
			{ id: 'url', title: 'URL' },
			{ id: 'initiatorStack', title: 'Initiator Stack' },
			{ id: 'wait', title: 'Wait for server response' },
			{ id: 'downloading', title: 'Downloading from server' },
			{ id: 'totalWaitReceive', title: 'Total Wait and Downloading' },
			{ id: 'total', title: 'Total' }
		]
	});
	return csvWriter;
}

function parseFiles(entries) {
	const jsFiles = entries
		.filter(entry => entry.request.url.endsWith('.js') || entry.request.url.endsWith('.mjs'))

		.map(entry => ({
			url: entry.request.url,
			initiatorStack: getInitiatorStack(entry),
			timings: {
				wait: entry.timings.wait,
				downloading: entry.timings.receive,
				totalWaitReceive: entry.timings.wait + entry.timings.receive,
				total: entry.time
			},
		}));
	return jsFiles;
}

function getInitiatorStack(entry) {

	if (entry._initiator.type === 'script' || entry._initiator.type === 'parser') {

		if (entry._initiator.stack) {
			return entry._initiator.stack.callFrames.map(callFrame => callFrame.url + ' line ' + callFrame.lineNumber + ' column ' + callFrame.columnNumber).join('\n');

		} else {
			return entry._initiator.url + ' line ' + entry._initiator.lineNumber;
		}
	}
}

function processData(err, data, fileName) {

	if (err) {
		console.log('An error occurred while reading the HAR file.');
		return console.log(err);
	}
	const harData = JSON.parse(data);
	const entries = harData.log.entries;

	const jsFiles = parseFiles(entries);

	const csvWriter = prepareCsvAndHeaders(fileName);

	let records = addRecords(jsFiles);

	csvWriter.writeRecords(records)
		.then(() => {
			console.log('...Done');
		});
}

// Main processing code goes in a function to be exported
function processHarFile(filePath) {
	const fs = require('fs');

	const fileName = filePath.split('/').pop();

	fs.readFile(filePath, 'utf8', processData);
}

// Make it accessible for importing to other files or test scripts
module.exports = processHarFile;

// This condition checks to see if this script is the main module (i.e., not being imported)
if (require.main === module) {
	// Call the processHarFile function only if it's not being imported
	const filePath = process.argv[3];
	processHarFile(filePath);
}





