import { parentPort } from 'worker_threads'

parentPort?.postMessage('hi from worker2')
