import HarProcessor from './src/ProcessHar.js';

const filePath = process.argv[3];
const fileTypesToProcess = process.argv[4] !== 'null' && typeof process.argv[4] !== 'undefined' ? process.argv[4].split(',') : [];
const resourceTypesToProcess = process.argv[5] !== 'null' && typeof process.argv[5] !== 'undefined' ? process.argv[5].split(',') : [];

function customGetInitiatorStack(entry) {
	return entry._initiator.stack
		? entry._initiator.stack.callFrames.map(
			(callFrame) => `${callFrame.url} line ${callFrame.lineNumber} column ${callFrame.columnNumber}`
		).join('\n')
		: `${entry._initiator.url} line ${entry._initiator.lineNumber}`;
}

function customGetTotalWaitReceive(entry) {
	return entry.timings.wait + entry.timings.receive;
}

const customFunctions = [
	customGetInitiatorStack,
	customGetTotalWaitReceive
];

const harProcessor = new HarProcessor();
harProcessor.runProcessing(filePath, fileTypesToProcess, resourceTypesToProcess, '', customFunctions);

