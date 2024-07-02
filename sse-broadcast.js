let clientsToNotify = new Set();
let currentId = 0;

export function sseBroadcast() {
    return (request, response, next) => {
        response.initStream = () => {
            response.writeHead(200, {
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive'
            });

            clientsToNotify.add(response);

            const intervalId = setInterval(() => {
                response.write(`:\n\n`);
                response.flush();
            }, 30000);

            response.on('close', () => {
                clientsToNotify.delete(response);
                clearInterval(intervalId);
                response.end();
            });
        };

        response.pushEvent = (data, eventName) => {
            let dataString = `id: ${ currentId }\ndata: ${ JSON.stringify(data) }\n`;
            dataString += eventName ? `event: ${ eventName }\n\n` : '\n';
            for(let client of clientsToNotify){
                client.write(dataString);
                client.flush();
            }

            currentId++;
        };

        next();
    }
} 