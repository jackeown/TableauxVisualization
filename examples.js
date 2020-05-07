// This file loosely defines a schema and examples of things...
// It also defines useful functions related to statements


let types = [
    "individual", 
    "class", "classApplication", "subclass", 
    "role", "roleApplication", "restriction",
    "negation", "complement",
    "and", "intersection",
    "or", "union",
    "implication"
];




function isTbox(s){
    s = NNF(s); // makes sure I don't have to deal with double negatives and stuff...
    return ["class", "union", "intersection", "complement"].includes(s.type);
}


// not sure about these anyway, but I don't think I need them yet...

// function isAbox(s){
//     s = NNF(s);

// }

// function isRbox(s){
//     s = NNF(s);
//     let types = ["roleApplication"];
//     return (s.type == "negation" || types.includes(s.children[0].type) || types.includes(s.type);
// }






examples = {

    // individuals
    individual: {
        type: "individual",
        name: "a"
    },
    
    
    // Classes
    class: {
        type: "class",
        name: "C"
    },
    
    // empty set and universe
    // Is this the right way to do it?
    emptyClass: {
        type: "class",
        name: "Empty"
    },
    
    universe: {
        type: "class",
        name: "Universe"
    },
    
    
    
    // Class applications (like C(a))
    classApp: {
        type: "classApplication",
        children: [
            {
                type: "class",
                name: "C"
            },
            {
                type: "individual",
                name: "a"
            }
        ]
    },
    
    
    // SubClass (like C \sqsubseteq D)
    subclass: {
        type: "subclass",
        children: [
            {
                type: "class",
                name: "C"
            },
            {
                type: "class",
                name: "D"
            },
        ]
    },
    
    
    
    // Roles (relationships)
    role: {
        type: "role",
        name: "R"
    },
    
    
    
    // Role applications (like R(a,b))
    roleApp: {
        type: "roleApplication",
        children: [
            {
                type: "role",
                name: "R"
            },
            {
                type: "individual",
                name: "a"
            },
            {
                type: "individual",
                name: "b"
            }
        ]
    },
    
    
    
    // Role restrictions
    // Role restrictions are classes...so how do I represent that well?
    // Same thing for intersections and Unions...maybe I just have to parse 
    // classes, role restrictions, unions, intersections, and classes all as classes eventually...
    restriction: {
        type: "restriction",
        quantifier: "universal",
        children: [
            {
                type: "role",
                name: "R"
            },
            {
                type: "class",
                name: "C"
            }
        ]  
    },
    
    
    // Negation (applied only to class applications or role applications)
    negation: {
        type: "negation",
        children: [
            {
                type: "individual",
                name: "a"
            }
        ]
    },
    
    // Complement (applied only to classes)
    complement: {
        type: "complement",
        children: [
            {
                type: "class",
                name: "C"
            }
        ]
    },
    
    
    
    // And (applied only to class applications or role applications)
    and: {
        type: "and",
        children: [
            {
                type: "classApplication",
                children: [
                    {
                        type: "class",
                        name: "C"
                    },
                    {
                        type: "individual",
                        name: "a"
                    }
                ]
            },
            {
                type: "classApplication",
                children: [
                    {
                        type: "class",
                        name: "D"
                    },
                    {
                        type: "individual",
                        name: "b"
                    }
                ]
            }
        ]
    },
    
    // Intersection (applied only to classes)
    intersection: {
        type: "intersection",
        children: [
            {
                type: "class",
                name: "C"
            },
            {
                type: "class",
                name: "D"
            },
            {
                type: "class",
                name: "E"
            }
        ]
    },
    
    
    // Or (applied only to class applications or role applications)
    or: {
        type: "or",
        children: [
            {
                type: "classApplication",
                children: [
                    {
                        type: "class",
                        name: "C"
                    },
                    {
                        type: "individual",
                        name: "a"
                    }
                ]
            },
            {
                type: "classApplication",
                children: [
                    {
                        type: "class",
                        name: "D"
                    },
                    {
                        type: "individual",
                        name: "b"
                    }
                ]
            }
        ]
    },
    
    // Union (applied only to classes)
    union: {
        type: "union",
        children: [
            {
                type: "class",
                name: "C"
            },
            {
                type: "class",
                name: "D"
            },
            {
                type: "class",
                name: "E"
            }
        ]
    },
    
    
    // Implication (applied only to class applications or role applications)
    implication: {
        type: "implication",
        children: [
            {
                type: "classApplication",
                children: [
                    {
                        type: "class",
                        name: "C"
                    },
                    {
                        type: "individual",
                        name: "a"
                    }
                ]
            },
            {
                type: "classApplication",
                children: [
                    {
                        type: "class",
                        name: "D"
                    },
                    {
                        type: "individual",
                        name: "b"
                    }
                ]
            }
        ]
    }
}

examples.problems = {};

let Empty = {type: "class", name: "Empty"};
let Universe = {type: "class", name: "Universe"};



// Unicorn Example...

let Unicorn = {type: "class", name: "Unicorn"};
let Fictitious = {type: "class", name: "Fictitious"};
let Animal = {type: "class", name: "Animal"};
let cloverJollyBridle = {type: "individual", name: "cloverJollyBridle"};

examples.problems.unicorn = [
    {
        type: "subclass",
        children: [Unicorn, Animal]
    },
    {
        type: "subclass",
        children: [Unicorn, Fictitious]
    },
    {
        type: "subclass",
        children: [{type: "intersection", children: [Fictitious, Animal]}, Empty]
    },
    {
        type: "classApplication",
        children: [Unicorn, cloverJollyBridle]
    }
];

// minified Unicorn example...

Unicorn = {type: "class", name: "U"};
Fictitious = {type: "class", name: "F"};
Animal = {type: "class", name: "A"};
cloverJollyBridle = {type: "individual", name: "c"};

examples.problems.minifiedUnicorn = [
    {
        type: "subclass",
        children: [Unicorn, Animal]
    },
    {
        type: "subclass",
        children: [Unicorn, Fictitious]
    },
    {
        type: "subclass",
        children: [{type: "intersection", children: [Fictitious, Animal]}, Empty]
    },
    {
        type: "classApplication",
        children: [Unicorn, cloverJollyBridle]
    }
];



// Example from problem 3...

let A = {type: "class", name: "A"};
let B = {type: "class", name: "B"};
let C = {type: "class", name: "C"};
let D = {type: "class", name: "D"};

let BD = {type: "intersection", children: [B,D]};
let conjecture = {type: "subclass", children: [A,D]};

examples.problems.three = [
    // Axioms
    {
        type: "subclass",
        children: [A, BD]
    },
    {
        type: "subclass",
        children: [C,D]
    },

    // Negated Conjecture
    {
        type: "complement",
        children: [conjecture]
    }
];




// Primate Example...

let Primate = {type: "class", name: "Primate"};
let Home = {type: "class", name: "Home"};
let speaksWith = {type: "role", name: "speaksWith"};

let primateConjecture = {
    type: "subclass",
    children: [
        {
            type: "restriction",
            quantifier: "existential",
            children: [speaksWith, Universe]
        },
        Primate
    ]
};

examples.problems.primate = [
    // axioms
    {
        type: "subclass",
        children: [Home, Primate]
    },
    {
        type: "subclass",
        children: [            
            {
                type: "restriction",
                quantifier: "existential",
                children: [speaksWith, Universe]
            },
            Home
        ]
    },

    // negated conjecture.
    {
        type: "complement",
        children: [primateConjecture]
    }

];

