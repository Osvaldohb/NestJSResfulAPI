

export const appConfig=()=>({
    enviroment: process.env.NODE_ENV || 'dev',
    mongodb:process.env.MONGODB,
    port: +(process.env.PORT || 4000),
    defaultLimit: +(process.env.DEFAULT_LIMIT || 5)
})