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


// let persons = [
//     { 
//       id: "1",
//       name: "Arto Hellas", 
//       number: "040-123456"
//     },
//     { 
//       id: "2",
//       name: "Ada Lovelace", 
//       number: "39-44-5323523"
//     },
//     { 
//       id: "3",
//       name: "Dan Abramov", 
//       number: "12-43-234345"
//     },
//     { 
//       id: "4",
//       name: "Mary Poppendieck", 
//       number: "39-23-6423122"
//     }
// ]

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

app.post('/api/persons', (req, res) => {
    const body = req.body
    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
      res.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

// app.get('/api/persons/:id', (req, res) => {
//     const id = req.params.id
//     const person = persons.find(i => i.id === id)
//     if (person) {
//         res.json(person)
//     } else {
//         res.status(404).json({error: 'The requested person does not exist'})
//     }
// })

// app.delete('/api/persons/:id', (req, res) => {
//     const id = req.params.id
//     persons = persons.filter(i => i.id !== id)
//     res.status(204).end()
// })


// const generateId = () => {
//     const id = Math.floor((Math.random() * 100000))
//     return String(id)
// }


// app.post('/api/persons', (req, res) => {
//     // console.log(req.body)
//     const body = req.body
//     const uniqueName = !persons.some(p => p.name === body.name)
//     if(!body.name || !body.number || !uniqueName) {
//         return res.status(400).json({error: 'Name must be unique and name/number cannot be empty'})
//     }
//     const person = {
//         id: generateId(),
//         name: body.name,
//         number: body.number
//     }
//     persons = persons.concat(person)
//     res.json(person)
//     }
// )

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id'})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT 
// || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })