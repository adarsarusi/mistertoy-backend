import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'

const app = express()

// App config
app.use(express.json())
app.use(cookieParser())

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('public'))
} else {
	app.use(cors({
		origin: [
			'http://localhost:5173',
			'http://127.0.0.1:5173',
			'http://localhost:5174',
			'http://127.0.0.1:5174',
		],
		credentials: true,
	}))
}

app.get('/api/toy', (req, res) => {
	const { name, inStock, labels, sortBy, sortDir } = req.query

	const filterBy = {
		name,
		inStock,
		labels: labels ? labels.split(',') : []
	}

	const sort = {
		sortBy,
		sortDir: +sortDir || 1
	}

	toyService.query(filterBy, sort)
		.then(toys => res.send(toys))
		.catch(err => {
			console.log('Had issues getting toys', err)
			res.status(400).send({ msg: 'Had issues getting toys' })
		})
})

app.get('/api/toy/:id', (req, res) => {
	const toyId = req.params.id

	toyService.getById(toyId)
		.then(toy => res.send(toy))
		.catch(err => {
			console.log('Had issues getting toy', err)
			res.status(400).send({ msg: 'Had issues getting toy' })
		})
})

app.delete('/api/toy/:id', (req, res) => {
	const toyId = req.params.id

	toyService.remove(toyId)
		.then(() => res.send({ msg: 'Deleted successfully' }))
		.catch(err => {
			console.log('Had issues deleting toy', err)
			res.status(400).send({ msg: 'Had issues deleting toy' })
		})
})

app.post('/api/toy', (req, res) => {
	const toy = req.body

	if (!toy.name) {
		return res.status(400).send({ msg: 'Toy must have a name' })
	}

	toyService.save(toy)
		.then(savedToy => res.send(savedToy))
		.catch(err => {
			console.log('Had issues adding toy', err)
			res.status(400).send({ msg: 'Had issues adding toy' })
		})
})

app.put('/api/toy/:id', (req, res) => {
	const toy = { ...req.body, _id: req.params.id }

	toyService.save(toy)
		.then(savedToy => res.send(savedToy))
		.catch(err => {
			console.log('Had issues updating toy', err)
			res.status(400).send({ msg: 'Had issues updating toy' })
		})
})

app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => res.status(400).send('Cannot load users'))
})

app.get('/api/user/:userId', (req, res) => {
    userService.getById(req.params.userId)
        .then(user => res.send(user))
        .catch(err => res.status(400).send('Cannot load user'))
})

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body

    userService.login({ username, password })
        .then(user => res.send(user))
        .catch(() => res.status(401).send('Invalid login'))
})

app.post('/api/auth/signup', (req, res) => {
    const { username, password, fullname } = req.body

    userService.signup({ username, password, fullname })
        .then(user => res.send(user))
        .catch(err => res.status(400).send(err))
})

app.post('/api/auth/logout', (req, res) => {
    res.send({ msg: 'Logged out' })
})

app.get('{*splat}', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
})