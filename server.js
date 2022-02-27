const fs = require('fs');
const path = require('path');
const express = require('express');
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
//this is for heroku and sets an environment variable called process.env.PORT

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
};

function findById(id, animalsArray) {
    //created a function that takes two parameters one id and the other animalArray

    const result = animalsArray.filter(animal => animal.id === id)[0];
    //we are filtering animalsArray by id and then attaching the result to result


    return result;
    //returning the result
};

function createNewAnimal(body, animalsArray) {
    const animal = body;
    //assign the body variable to animal


    animalsArray.push(animal);
    //passing the parameter to the animalsArray using the push method

    fs.writeFileSync(
        //use the fs node module to establish the path for our json file
        //synchronous version of fs.writeFIle()
        path.join(__dirname, './data/animals.json'),
        //this a synchronous version that does not require a callback
        //we use path.join to join the value od the __dirname which represents thr directory of thr file we execute the code with.

        JSON.stringify({ animals: animalsArray })
        //save the JS array data as JSON
    );

    return animal;
    //return the contents of animal and have what is being saved to animal exposed to other functions
};

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        //if not an animal name or type of animal return false
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        //if not a species or type of species return false
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        //if not diet or type of diet return false
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        //if not type of personality trait that is in the current array return false
        return false;
    }
    return true;
}


//routes
app.get('/api/animals', (req, res) => {

    let results = animals;
    //attaching animals(json data) to the variable results

    if (req.query) {
        //if we are doing a query then run this code
        results = filterByQuery(req.query, results);
        //use the function filterByQuery get the results and attach them to results
    };
    console.log(req.query);
    //req.query will post whatever is in the query string to the terminal

    res.json(results);
    //this is passing the parameter results through the response
});

app.get('/api/animals/:id', (req, res) => {
    //created a new route with <route>/: <parameter name>
    const result = findById(req.params.id, animals);
    //using findById and passing the parameters of req.params.id, and animals (takes two parameters) and then assigning it to results
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }

    //res.json with the parameter results makes the data work in a json format

});

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // add animal to json file and animals array in this function
    // const animal = createNewAnimal(req.body, animals);

    //if any data in req.body is incorrect, send a 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('the animal is not properly formatted. ')
    } else {
        const animal = createNewAnimal(req.body, animals);
    }

    // console.log(req.body.id);
    // console.log(req.body)
    res.json(animals);

});
//this route accepts data because it's an empty object

app.get('/', (req, res) => {
    res.send(path.join(__dirname, './public/index.html'))

});
//this route is for the actual code for the index.html
app.listen(PORT, () => {
    console.log('API server is now on port ${PORT}!');
});