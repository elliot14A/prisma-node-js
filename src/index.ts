import Hapi from "@hapi/hapi";
import status from "./plugins/status";
import prisma from './plugins/prisma';
import users from './plugins/users';

const server: Hapi.Server = Hapi.server({
    port: 8000,
    host: 'localhost'
});

export async function start(): Promise<Hapi.Server> {
    await server.register([status, prisma, users])
    await server.start();
    return server;
}

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

start()
    .then(server => (console.log(`Server running on ${server.info.uri}`)))
    .catch(err => console.error(err)); 