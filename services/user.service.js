import fs from 'fs'
import { utilService } from './util.service.js'

const USER_PATH = 'data/user.json'
let users = utilService.readJsonFile(USER_PATH)

export const userService = {
    query,
    getById,
    login,
    signup
}

function query() {
    return Promise.resolve(users)
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    return Promise.resolve(_sanitizeUser(user))
}

function login({ username, password }) {
    const user = users.find(user => user.username === username)

    if (!user) return Promise.reject('Invalid login')
    if (user.password !== password) return Promise.reject('Invalid login')

    return Promise.resolve(_sanitizeUser(user))
}

function signup({ username, password, fullname }) {
    if (users.find(user => user.username === username)) {
        return Promise.reject('Username taken')
    }

    const user = {
        _id: utilService.makeId(),
        username,
        password,
        fullname,
        balance: 100,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }

    users.push(user)
    _saveUsers()

    return Promise.resolve(_sanitizeUser(user))
}

function _saveUsers() {
    fs.writeFileSync(USER_PATH, JSON.stringify(users, null, 2))
}

function _sanitizeUser(user) {
    if (!user) return null
    return {
        _id: user._id,
        fullname: user.fullname,
        balance: user.balance
    }
}