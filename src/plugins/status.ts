import Hapi from "@hapi/hapi";

const plugin: Hapi.Plugin<undefined> = {
    name: 'app/status',
    register:async (server: Hapi.Server) => {
        server.route({
            path: "/",
            method: "GET",
            handler: (_, res: Hapi.ResponseToolkit) => {
                return res.response({up: true}).code(200);
            }
        })
    }
};

export default plugin;