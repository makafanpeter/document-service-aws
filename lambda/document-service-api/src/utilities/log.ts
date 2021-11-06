import * as winston from 'winston';

const log : winston.Logger = winston.createLogger({
    level: process.env.LogLevel || 'info',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export default log;