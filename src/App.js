import { useState, useEffect } from 'react'
import contactService from './services/contacts.js'

const Contact = (props) => {
  return (
    <div>
      <p>{props.name} {props.number}</p>
      <button onClick={() => props.deleteContact(props.id)}>delete</button>
    </div>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.addPerson}>
      <div>
        name: <input
          value={props.newName}
          onChange={props.handleNameChange}
        />
      </div>
      <div>
        number: <input
          value={props.newNumber}
          onChange={props.handleNumberChange}
          tel="true"
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Filter = (props) => {
  return (
    <div>filter shown with: <input
        value={props.filterBy}
        onChange={props.handleFilterChange}
      />
    </div>
  )
  
} 

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterBy, setFilterBy] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilterBy(event.target.value);
  }

  const deleteContact = (id) => {
    if (window.confirm("Do you really want to delete this contact?")) {
      contactService
      .removeContact(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
      })
    }
  }

  const filtered = () => {
    let matchTo = new RegExp(`${filterBy}`);
    return persons.filter(person => {
      return matchTo.test(new RegExp(person.name));
    });
  }

  const filterContacts = filterBy !== ''
    ? filtered(persons)
    : persons

  function addPerson(event) {
    event.preventDefault()
    const personObj = {
      name: newName,
      number: newNumber
    }

    if (persons.map(person => {
      return person.name
    }).includes(personObj.name)) {
      if (window.confirm(`${personObj.name} is already added to phonebook, replace the old number with a new one?`)) {
        let id = persons.filter(person => person.name === personObj.name)[0].id;
        contactService
          .update(id, personObj)
          .then(returnedPerson => {
            setPersons(persons.map(person => {
              if (person.id === id) {
                return returnedPerson
              } else {
                return person
              }
            }))
            setErrorMessage(
              `The number for ${personObj.name} has been updated`
            )
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
      }
    } else {
      contactService
        .create(personObj)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setErrorMessage(
            `Added ${personObj.name}`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  useEffect(() => {
    contactService
      .getAll()
      .then(response => {
        setPersons(response)
      })
  }, [])
  console.log('render', persons.length, 'notes')

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} />
      <Filter filterBy={filterBy} handleFilterChange={handleFilterChange} />
      <h2>add a new</h2>
      <PersonForm addPerson={addPerson} newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange} />
      <h2>Numbers</h2>
      {filterContacts.map(contact => {
        return <Contact key={contact.id} name={contact.name} number={contact.number} deleteContact={deleteContact} id={contact.id} />
      })}
    </div>
  )
}

export default App
