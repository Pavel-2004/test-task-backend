const { Worker } = require('worker_threads');

function runWorker(workerFile, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerFile);



    worker.postMessage(data);

    worker.on('message', (result) => {
      if (result.success) {
        resolve(result.data);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

module.exports = { runWorker };