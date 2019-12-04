const gremlin = require('gremlin');
// const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;

const connection = new DriverRemoteConnection('ws://localhost:8182/gremlin');

const Graph = gremlin.structure.Graph;
const graph = new Graph();

const g = graph.traversal().withRemote(connection);

console.log('Welcome to gremlin');

function getAllVertices() {
    g.V().toList()
        .then((results) => {
            console.log('Vertices (' + results.length + '): ' + JSON.stringify(results));
        })
        .catch((err) => {
            console.error('Error while getting all vertices: ' + err);
        });
}

function getAllEdges() {
    g.E().toList()
        .then((results) => {
            console.log('Edges (' + results.length + '): ' + JSON.stringify(results));
        })
        .catch((err) => {
            console.error('Error while getting all edges: ' + err);
        });
}

function getAllPersons() {
    g.V().hasLabel('person').values('name').toList()
        .then((results) => {
            console.log('Persons (' + results.length + '): ' + JSON.stringify(results));
        })
        .catch((err) => {
            console.error('Error while getting all persons: ' + err);
        });
}

function getAllSoftwares() {
    g.V().hasLabel('software').values('name').toList()
        .then((results) => {
            console.log('Softwares (' + results.length + '): ' + JSON.stringify(results));
        })
        .catch ((err) => {
            console.log('Error while getting all softwares: ' + err)
        });
}

async function countSoftwares() {
    try {
        const count = await g.V().hasLabel('software').count().next();
        if (count && count['value']) {
            console.log('Softwares count: ' + count['value']);
        } else {
            console.log('Softwares count: 0');
        }
    } catch (err) {
        console.error('Error while counting softwares: ' + err);
    }
}

async function countPersons() {
    try {
        const count = await g.V().hasLabel('person').count().next();
        if (count && count['value']) {
            console.log('Persons count: ' + count['value']);
        } else {
            console.log('PErsons count result undefined.');
        }
    } catch (err) {
        console.error('Error while counting persons: ' + err);
    }
}

async function addPerson(name, age) {
    try {
        const exists = await g.V().hasLabel('person').has('name', name).next();
        if (exists && exists['value']) {
            console.log('Person ' + name + ' already exists');
        } else {
            const newVertex = await g.addV("person").property('name', name).property("age", age).next();
            console.log('New person: ' + JSON.stringify(newVertex));
        }
    } catch (err) {
        console.error(err);
    }
}

async function addSoftware(name, lang) {
    try {
        const exists = await g.V().hasLabel('software').has('name', name).has('lang', lang).next();
        if (exists && exists['value']) {
            console.log('Software ' + name + ' already exists');
        } else {
            const newVertex = await g.addV("software").property('name', name).property("lang", lang).next();
            console.log('New software: ' + JSON.stringify(newVertex));
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteSoftware(name, lang) {
    try {
        const vertex = await g.V().has('software', 'name', name).has('lang', lang).next();
        console.log('Vertex to delete: ' + JSON.stringify(vertex));
        const id = vertex['value']['id'];
        const result = await g.V(id).drop().next();
        console.log('Deleted result: ' + JSON.stringify(result));
    } catch (err) {
        console.error('Error while deleting software ' + name + ', error: ' + err);
    }
}

async function deleteAllSoftwares() {
    try {
        await g.V().hasLabel('software').drop().iterate();
        console.log('Deleted all softwares');
    } catch (err) {
        console.error('Error while deleting all softwares: ' + err);
    }
}

async function deleteAllPersons() {
    try {
        await g.V().hasLabel('person').drop().iterate();
        console.log('Deleted all persons');
    } catch (err) {
        console.error('Error while deleting all persons: ' + err);
    }
}

async function deleteAll() {
    try {
        await g.V().drop().iterate();
        console.log('Deleted all vertices');
    } catch (err) {
        console.error('Error while deleting all vertices: ' + err);
    }
}

async function addEdge(person, software) {
    try {
        const v1 = await g.V().has('person', 'name', person).next();
        const v2 = await g.V().has('software', 'name', software).next();
        if (v1 && v2) {
            const v1id = v1['value']['id'];
            const v2id = v2['value']['id'];
            if (v1id && v2id) {
                const newEdge = await g.V(v1id).addE('created').to(g.V(v2id)).property('weight', 0.4).next();
                console.log('New edge: ' + JSON.stringify(newEdge));
            }
        }
    } catch (err) {
        console.error('Error while adding edge: ' + err);
    }
}

async function deleteEdge(person, software) {
    try {
        const v1 = await g.V().has('person', 'name', person).next();
        const v2 = await g.V().has('software', 'name', software).next();
        if (v1 && v2) {
            const v1id = v1['value']['id'];
            const v2id = v2['value']['id'];
            if (v1id && v2id) {
                const result = await g.V(v1id).outE('created').inV().hasId(v2id).drop().iterate();
                if (result && result['done']) {
                    console.log('Edge deleted successfully');
                } else {
                    console.log('Edge between ' + person + ' and ' + software + ' does not exists');
                }
            }
        }
    } catch (err) {
        console.error('Error while deleting edge: ' + err);
    }
}

// Get list of creators for a software
async function getCreators(software) {
    const result = await g.V().has('software', 'name', software).next();
    console.log(result);
}

// Get list of softwares created by person
async function getSoftwares(person) {
    try {
        const results = await g.V().has('person', 'name', person).out('created').values('name').toList();
        if (results) {
            console.log('Softwares created by ' + person + ': ' + JSON.stringify(results));
        } else {
            console.log('No results found');
        }
    } catch (err) {
        console.error('Error while getting softwares created by ' + person + ': ' + err);
    }
}

addPerson('linus', 45);
addPerson('james', 64);

addSoftware('git', 'bash');
addSoftware('linux', 'bash');
addSoftware('java', 'c');

addEdge('linus', 'git');
addEdge('linus', 'linux');
addEdge('james', 'java');

getAllVertices();
getAllEdges();

getAllSoftwares();
getAllPersons();

countSoftwares();

// deleteAllSoftwares();
// deleteAllPersons();

// deleteEdge('linus', 'git');
// deleteEdge('linus', 'linux');
// deleteEdge('james', 'java');
