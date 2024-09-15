const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/person')

const PORT = process.env.PORT
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

let PERSONS = []
app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    PERSONS.push(persons)
    return res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end('<h1>Person not found...</h1>')
      }
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  const person = new Person({
    name,
    number
  })

  person
    .save()
    .then((savedPerson) => res.json(savedPerson))
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  const id = req.params.id

  const person = {
    name,
    number
  }

  const options = {
    new: true,
    runValidators: true,
    context: query
  }

  Person.findByIdAndUpdate(id, person, options)
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndDelete(id)
    .then((person) => res.json(person).status(204).end())
    .catch((error) => next(error))
})

app.get('/api/info', (req, res) => {
  const date = new Date()
  const personNo = PERSONS[0]

  res.send(
    `<h2>Phonebook has information for ${personNo?.length || 0} ${
      personNo?.length > 1 ? 'persons' : 'person'
    } <br /> ${date}</h2>`
  )
})

app.use(
  morgan('dev', {
    skip: function (req, res) {
      return res.statusCode < 400
    }
  })
)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

app.listen(PORT, console.log(`Server is running on port ${PORT}...`))
