require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express() 

app.use(express.json()) 
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

morgan.token('body', (req, res) => req.method === "POST" ? JSON.stringify(req.body) : null)



app.get('/api/info', (req, res) => {
  Person.countDocuments({})
    .then(entries => {
      const date = new Date()
      res.send(`<p>Phonebook has info for ${entries} people</p><p>${date}</p>`)
    })
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
  })

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
  .then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end({error: 'The requested person does not exist'})
    }
  })
  .catch(error => next(error))
})  

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if(!body.name || !body.number) {
      return res.status(400).json({error: 'Name/number cannot be empty'})
    }

    Person.findOne({ name: body.name })
      .then(existingPerson => {
        if (existingPerson) {
          return res.status(400).json({error: 'Contact already exists'})
        }

        const person = new Person ({
          name: body.name,
          number: body.number
        })

      return person.save().then(savedPerson => {
        res.status(201).json(savedPerson)
      })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name, 
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })