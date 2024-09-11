const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const PORT = process.env.PORT || 3000
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', function (req, res) {
	return JSON.stringify(req.body)
})

let persons = [
	{
		id: '1',
		name: 'Arto Hellas',
		number: '040-123456'
	},
	{
		id: '2',
		name: 'Ada Lovelace',
		number: '39-44-5323523'
	},
	{
		id: '3',
		name: 'Dan Abramov',
		number: '12-43-234345'
	},
	{
		id: '4',
		name: 'Mary Poppendieck',
		number: '39-23-6423122'
	}
]

const generateId = () => {
	const id = Math.floor(Math.random() * 199)
	return String(id)
}

const validatePerson = (name, number) => {
	let response = { isValid: true, errorMsg: '' }

	if (!name || !number) {
		response = {
			isValid: false,
			errorMsg: 'Please fill in the required information...'
		}
	}

	persons.find((person) => {
		if (person.name === name) {
			response = { isValid: false, errorMsg: 'name must be unique' }
		} else if (person.number === number) {
			response = { isValid: false, errorMsg: 'number must be unique' }
		}
	})
	return response
}

app.get('/info', (req, res) => {
	const date = new Date()
	res.send(
		`<p>Phonebook has info for ${persons.length} ${
			persons.length > 1 ? 'persons' : 'person'
		} <br /> ${date}</p>`
	)
})

app.get('/api/persons', (req, res) => {
	res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
	const id = req.params.id
	persons = persons.find((person) => person.id === id)
	if (persons) {
		res.json(persons)
	} else {
		res.status(404).end('<h1>Person not found...</h1>')
	}
})

app.post(
	'/api/persons',
	morgan(':method :url :status :res[content-length] - :response-time :body'),
	(req, res) => {
		const { name, number } = req.body
		const { isValid, errorMsg } = validatePerson(name, number)

		if (!isValid) {
			return res.status(400).json(errorMsg)
		}

		const person = {
			id: generateId(),
			name,
			number
		}

		persons = persons.concat(person)
		return res.json(person)
	}
)

app.delete('/api/persons/:id', (req, res) => {
	const id = req.params.id
	persons = persons.filter((person) => person.id !== id)
	res.status(204).end()
})

app.use(
	morgan('dev', {
		skip: function (req, res) {
			return res.statusCode < 400
		}
	})
)

app.listen(PORT, console.log(`Server is running on port ${PORT}...`))
