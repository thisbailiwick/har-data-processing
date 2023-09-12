// import {runProcessing} from "./src/process-har.js";
const filePath = process.argv[3];
const fileTypesToProcess = process.argv[4] !== 'null' && typeof process.argv[4] !== 'undefined' ? process.argv[4].split(',') : [];
const resourceTypesToProcess = process.argv[5] !== 'null' && typeof process.argv[5] !== 'undefined' ? process.argv[5].split(',') : [];
// runProcessing(filePath, fileTypesToProcess, resourceTypesToProcess);


import HarProcessor from './src/ProcessHar.js';

const harProcessor = new HarProcessor();
harProcessor.runProcessing(filePath, fileTypesToProcess, resourceTypesToProcess);

