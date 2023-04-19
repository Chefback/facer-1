// api/controllers/authentication.controller.js

const { Admin } = require('../models')

const authAdminSecret = require('../../nuxt.config.js').env.AUTH_USER_SECRET
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const jwt = require('jsonwebtoken')

async function CreateAdmin(name, password) {
    return await Admin.create({ username: name, password: password })
        .then((data) => {
            return data
        }).catch((error) => {
            throw error
        })
}

async function generatePasswordHash(plainPassword) {
    return await bcrypt.hash(plainPassword, 12)
}

async function GetAdmin(name) {
    return await Admin.findOne({ username: name }).then((user) => {
        return user
    }).catch((err) => { return err })
}
// api/controllers/authentication.controller.js


passport.use(
    new LocalStrategy(
        {
            usernameField: 'name',
            passwordField: 'password'
        },
        async function (username, password, done) {
            await GetAdmin(username)
                .then((admin) => {
                    return admin
                }).then(async (user) => {
                    if (!user) {
                        return done(null, false, { message: 'Authentication failed' })
                    }
                    const validation = await comparePasswords(password, user.password)
                    if (validation) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Authentication failed' })
                    }
                }).catch((err) => {
                    return done(err)
                })
        }
    )
)

async function comparePasswords(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
}

function signAdminToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name
    }, authAdminSecret)
}
const tokenExtractor = function (req) {
    let token = null
    if (req && req.cookies && req.cookies['auth._token.local']) {
        const rawToken = req.cookies['auth._token.local'].toString()
        token = rawToken.slice(rawToken.indexOf(' ') + 1, rawToken.length)
    }
    return token
}

passport.use(new JwtStrategy({
    jwtFromRequest: tokenExtractor,
    secretOrKey: authAdminSecret
},
    async (jwtPayload, done) => {
        return GetAdmin(jwtPayload.name)
            .then((user) => {
                if (user) {
                    return done(null, {
                        name: user.name,
                    })
                } else {
                    return done(null, false, 'Failed')
                }
            })
            .catch((err) => {
                return done(err)
            })
    }
))

module.exports = {
    CreateAdmin, GetAdmin,
    generatePasswordHash, signAdminToken
}