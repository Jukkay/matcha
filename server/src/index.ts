import app from './app';
import { checkENV, getPort } from './utilities/checkENV';
import { sockets } from './sockets/sockets';

// Check environmental variables
checkENV();

// Server start
export const httpServer = app.listen(getPort(), () => {
	console.log(`API running in port ${getPort()}`);
});

// Socket.io initialization
sockets(httpServer);
