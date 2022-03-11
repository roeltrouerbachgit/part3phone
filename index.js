const express = require("express")
const morgan = require("morgan")
const cors = require('cors')
const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
}))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello there</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    const people = persons.length
    const reply = `<p>Phonebook has info for ${people} people</p>
                    <p>${date}</p>`
    response.send(reply)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => id === person.id)
    if(person) {
        response.json(person)
    } else {
        response.status(400).end()
    }

})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => id !== person.id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const id = Math.round(Math.random() * (1000 - 1 + 1))

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: "content missing"
        })
    }

    if(persons.find(person => body.number === person.number)) {
        return response.status(400).json({
            error: "name already exists"
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: id
    }
    persons = persons.concat(person)
    response.json(person)
    console.log(persons)
})

app.put('/api/persons/:id', (request, response) => {
    const body = request.body

    if(!body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const person = persons.find(n => n.id === body.id)
    const changedPerson = {...person, number: body.number}
    persons = persons.map(person => person.id !== body.id ? person : changedPerson)

    response.json(changedPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})