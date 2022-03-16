const mongoose = require('mongoose')

if(process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password> <name> <number>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://roeltest:${password}@coursecluster.flvvs.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)


if(process.argv.length === 3) {
    console.log('phonebook:')

    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
}

if(process.argv.length === 4) {
    console.log('Please provide the name and number as an argument: node mongo.js <password>')
    process.exit(1)
}

if(process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}




// const noteSchema = new mongoose.Schema({
//     content: String,
//     date: Date,
//     important: Boolean,
// })

// const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//     content: 'HTML is Easy',
//     date: new Date(),
//     important: true,
// })

// note.save().then(result => {
//     console.log('note saved!')
//     mongoose.connection.close()
// })


