const { app } = require('@azure/functions');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const db = new PrismaClient();

app.http('Login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
        context.log(`Http function processed request for url "${req.url}"`);

        const body = JSON.parse(await req.text());

        context.log(`Raw req body${body.name}`);

        if (!body.name || !body.password) {
            context.res = { status: 400, 
                            body: { message: 'Name and password are required fields.', data: {} },
                            headers: {
                                'Access-Control-Allow-Origin': '*', // Allow any origin
                                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                                'Access-Control-Allow-Headers': 'Content-Type',
                            }};
            return {
                ...context.res,
                body: JSON.stringify(context.res.body)
            };
        }
    
        let user;
       
    try {
        user = await db.users.findFirst({
            where: { name: body.name },
        });

        let userData = {
            id: user.id,
            name: user.name,
        };

        if (user && user.password === body.password) {
            context.res = { status: 200, 
                            body: { message:"User Data", data: userData },
                            headers: {
                                'Access-Control-Allow-Origin': '*', // Allow any origin
                                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                                'Access-Control-Allow-Headers': 'Content-Type',
                            }};
        } else {
            context.res = { status: 401, 
                            body: { message: "Invalid credentials", data: {} },
                            headers: {
                                'Access-Control-Allow-Origin': '*', // Allow any origin
                                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                                'Access-Control-Allow-Headers': 'Content-Type',
                            }};
        }
    } catch (error) {
        context.log('Database error:', error);
        context.res = { status: 500, 
                        body: {message: "Server error", data: error},
                        headers: {
                            'Access-Control-Allow-Origin': '*', // Allow any origin
                            'Access-Control-Allow-Methods': 'POST, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type',
                        }};
    }

        return {
            ...context.res,
            body: JSON.stringify(context.res.body)
        };
    }
});
