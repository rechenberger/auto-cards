// export default async function worker(data) {
//   console.log('worker', data)
//   return 'hi from worker'
// }

const { parentPort, workerData } = require('worker_threads')

parentPort?.postMessage('hi from worker')
