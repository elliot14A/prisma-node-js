import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";

interface UserInput {
    firstName: string,
    lastName: string,
    email: string,
    social: {
        facebook?: string,
        github?: string 
    }
}

const userInputValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    social: Joi.object({
        facebook: Joi.string().optional(),
        github: Joi.string().optional()
    })
});

const userPlugin: Hapi.Plugin<undefined> = {
    name: 'app/users',
    dependencies: ['prisma'],
    register: async function(server: Hapi.Server) {
        server.route([{
            method: 'POST',
            path: '/users',
            handler: createUserHandler,
            options: {
                validate: userInputValidator
            }
        },{
            method: 'GET',
            path: '/user/{userId}',
            handler: getUserHandler,
            options: {
                validate: {
                    params: Joi.object({
                        userId: Joi.number().integer()
                    }) as unknown as Hapi.RouteOptionsResponseSchema
                }
            }
        }, {
            method: 'DELETE',
            path:'/users',
            handler: deleteUserHandler,
            options : {
                validate: {
                    payload: Joi.object({
                        firstName: Joi.string().optional(),
                        lastName: Joi.string().optional(),
                        email: Joi.string().email().optional(),
                    }) as unknown as Hapi.RouteOptionsResponseSchema,
                    params: Joi.object({
                        userId: Joi.number().integer()
                    }) as unknown as Hapi.RouteOptionsResponseSchema
                }
            }
        }, {
            method: 'UPDATE', 
            path: '/users/{userId}',
            handler: updateUserHandler,
            options: {
                validate : {
                    params: Joi.object({
                        userId: Joi.number().integer()
                    }) as unknown as Hapi.RouteOptionsResponseSchema
                }
            }
        }])
    }
}

const createUserHandler = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = req.server.app;
    const payload = req.payload as UserInput;

    try {
        const createdUser = await prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                social: JSON.stringify(payload.social)
            },
            select: {
                id: true
            }
        })
        return h.response(createdUser).code(201);
    } catch(err) {
        console.log(err);
    }
}

const getUserHandler = async (req: Hapi.Request, res: Hapi.ResponseToolkit) => {
    const { prisma } = req.server.app;
    const userId = parseInt(req.params.userId);
    console.log(userId);

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!user) {
            return res.response().code(404);
        }
        return res.response(user).code(200);
    } catch(err) {
        console.log(err);
        return res.response().code(400);
    }
}


const deleteUserHandler = async (req: Hapi.Request, res: Hapi.ResponseToolkit) => {
    const { prisma } =  req.server.app;
    const userId = req.params.userId;

    try {
        await prisma.user.delete({
            where: {
                id: userId
            }
        })
        return res.response().code(204);
    } catch (err) {
        console.log(err);
        return res.response().code(500);
    }
}

const updateUserHandler = async (req: Hapi.Request, res: Hapi.ResponseToolkit) => {
    const { prisma } = req.server.app;
    const userId = req.params.userId;
    const payload = req.payload;

    try {
        await prisma.user.update({
            where : {
                id: userId
            },
            data: payload
        })
    } catch (err) {
        console.log(err);
    }
}

export default userPlugin;