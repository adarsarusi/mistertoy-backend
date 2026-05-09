import fs from 'fs'
import { utilService } from './util.service.js'

const TOY_PATH = 'data/toy.json'
let toys = utilService.readJsonFile(TOY_PATH)

export const toyService = {
    query,
    getById,
    save,
    remove
}

function query(filterBy = {}, sort = {}) {
    let filteredToys = [...toys]

    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.inStock && filterBy.inStock !== 'all') {
        filteredToys = filteredToys.filter(toy =>
            filterBy.inStock === 'in' ? toy.inStock : !toy.inStock
        )
    }

    if (filterBy.labels?.length) {
        filteredToys = filteredToys.filter(toy =>
            toy.labels.some(label => filterBy.labels.includes(label))
        )
    }

    if (sort.sortBy) {
        const sortDir = +sort.sortDir || 1

        filteredToys.sort((a, b) => {
            let valA = a[sort.sortBy]
            let valB = b[sort.sortBy]

            if (typeof valA === 'string') {
                return valA.localeCompare(valB) * sortDir
            }

            return (valA - valB) * sortDir
        })
    }

    return Promise.resolve(filteredToys)
}

function getById(_id) {
    const toy = toys.find(toy => toy._id === _id)
    return Promise.resolve(toy)
}

function remove(_id) {
    const idx = toys.findIndex(toy => toy._id === _id)
    if (idx === -1) return Promise.reject('Toy not found')

    toys.splice(idx, 1)
    _saveToysToFile()

    return Promise.resolve()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        if (idx === -1) return Promise.reject('Toy not found')

        toy.updatedAt = Date.now()
        toys[idx] = { ...toys[idx], ...toy }

    } else {
        toy._id = _makeId()
        toy.createdAt = toy.updatedAt = Date.now()
        toys.unshift(toy)
    }

    _saveToysToFile()
    return Promise.resolve(toy)
}

function _makeId(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let txt = ''
    for (let i = 0; i < length; i++) {
        txt += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return txt
}

function _saveToysToFile() {
    fs.writeFileSync(TOY_PATH, JSON.stringify(toys, null, 2))
}