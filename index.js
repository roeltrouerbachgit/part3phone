require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const req = require('express/lib/request')

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






app.get('/', (request, response) => {
    response.send('<h1>Hello there</h1>')
})

app.get('/info', (request, response, next) => {
    const date = new Date()

    Person.collection.countDocuments({})
        .then(result => {
            const reply = `<p>Phonebook has info for ${result} people</p>
                    <p>${date}</p>`
            response.send(reply)
        })
        .catch(error => next(error))

})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })

})

app.get('/api/persons/:id', (request, response, next) => {


    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(400).end()
        }
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {

    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "content missing"
        })
    }

    Person.find({ number: body.number })
        .then(result => {

            if (result === []) {
                const newPerson = {
                    name: body.name,
                    number: body.number
                }
                Person.findByIdAndUpdate(request.params.id, newPerson, { new: true })
                    .then(updatedPerson => {
                        response.json(updatedPerson)
                    })
                    .catch(error => next(error))
            } else {
                const newPerson = new Person({
                    name: body.name,
                    number: body.number,
                })

                newPerson
                .save()
                .then(savedPerson => {
                    response.json(savedPerson)
                })
                .catch(error => next(error))
               
            }
        })
        



})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    if (!number || !name) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    Person.findByIdAndUpdate(request.params.id, 
        { name, number},
         { new: true, runValidators: true, context: 'query'})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})





const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})