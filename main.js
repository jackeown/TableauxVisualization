// begin generic helprs

function choice(l){
    l = Array.from(l);
    let index = Math.floor(Math.random() * l.length);
    return l[index];
}

function copyJSON(obj){
    return JSON.parse(JSON.stringify(obj));
}

function all(bools){
    return bools.reduce((accumulator, current) => accumulator && current, true);
}

function any(bools){
    return bools.reduce((accumulator, current) => accumulator || current, false);
}

let L = "\\mathcal{L}"

// end generic helpers



// Renders a statement (tree of the above structures)
// as latex using mathjax. to include dollar signs, call render$tatement instead.

function renderStatement(statement){
    if (statement.canceled == true){
        let copy = copyJSON(statement);
        copy.canceled = false;
        return ` \\cancel{${renderStatement(copy)}} `;
    }

    if (["individual", "role"].includes(statement.type))
        return ` ${statement.name} `

    else if (statement.type == "class"){
        if (statement.name == "Empty"){
            return ` \\bot `;
        }
        else if(statement.name == "Universe"){
            return ` \\top `;
        }
        return ` ${statement.name} `;
    }

    else if (statement.type == "classApplication"){
        let classRender = renderStatement(statement.children[0]);
        let individualRender = renderStatement(statement.children[1]);
        return ` ${classRender}(${individualRender}) `;
    }
    
    else if (statement.type == "subclass"){
        let C = renderStatement(statement.children[0]);
        let D = renderStatement(statement.children[1]);
        return ` ${C} \\sqsubseteq ${D} `;
    }

    else if (statement.type == "implication"){
        let A = renderStatement(statement.children[0]);
        let B = renderStatement(statement.children[1]);
        return ` ${A} \\implies ${B} `;
    }

    else if (statement.type == "roleApplication"){
        let [R,a,b] = statement.children.map(renderStatement);
        return ` ${R}(${a}, ${b}) `
    }

    else if (statement.type == "restriction"){
        let [R, c] = statement.children.map(renderStatement);
        let quant = {universal: "\\forall", existential: "\\exists"}[statement.quantifier];
        return `${quant} ${R}.${c}`
    }

    else if (statement.type == "negation"){
        let A = renderStatement(statement.children[0]);
        if(["and", "or", "implication"].includes(statement.children[0].type)){
            A = `(${A})`;
        }
        return ` \\neg ${A}`;
    }

    else if (statement.type == "complement"){
        let A = renderStatement(statement.children[0]);
        if(["intersection", "union", "subclass", "restriction"].includes(statement.children[0].type)){
            A = `(${A})`;
        }
        return ` \\neg ${A}`;
    }

    else if (statement.type == "and"){
        let childRenders = [];
        for(let child of statement.children){
            if(["or", "restriction", "and"].includes(child.type)){
                childRenders.push(`(${renderStatement(child)})`);
            }
            else{
                childRenders.push(renderStatement(child));
            }
        }
        return childRenders.join(" \\sqcap ");
    }
        
    else if (statement.type == "intersection"){
        let childRenders = [];
        for(let child of statement.children){
            if(["union", "intersection"].includes(child.type)){
                childRenders.push(`(${renderStatement(child)})`);
            }
            else{
                childRenders.push(renderStatement(child));
            }
        }
        return childRenders.join(" \\sqcap ");
    }


    else if (statement.type == "or"){
        let childRenders = [];
        for(let child of statement.children){
            if(["or", "restriction", "and"].includes(child.type)){
                childRenders.push(`(${renderStatement(child)})`);
            }
            else{
                childRenders.push(renderStatement(child));
            }
        }
        return childRenders.join(" \\sqcup ");
    }
        
    else if (statement.type == "union"){
        let childRenders = [];
        for(let child of statement.children){
            if(["union", "intersection"].includes(child.type)){
                childRenders.push(`(${renderStatement(child)})`);
            }
            else{
                childRenders.push(renderStatement(child));
            }
        }
        return childRenders.join(" \\sqcup ");
    }
}

function render$tatement(statement){
    return `$$ ${renderStatement(statement)} $$`;
}


// Rules for conversion to negation normal form:
// https://en.wikipedia.org/wiki/Negation_normal_form
function NNF(statement){
    
    if(statement.type == "individual")
        return statement;

    else if(statement.type == "class")
        return statement;

    else if(statement.type == "classApplication")
        return {
            type: "classApplication",
            children: [
                NNF(statement.children[0]),
                NNF(statement.children[1])
            ]
        };

    else if(statement.type == "subclass")
        return {
            type: "union",
            children: [
                NNF({type: "complement", children: [statement.children[0]]}),
                NNF(statement.children[1])
            ]
        };

    // not sure about this one...
    // else if(statement.type == "role")
    //     return { };
    else if(statement.type == "role")
        return statement;

    else if(statement.type == "roleApplication")
        return {
            type: "roleApplication",
            children: [
                NNF(statement.children[0]),
                NNF(statement.children[1]),
                NNF(statement.children[2])
            ]
        };

    else if(statement.type == "restriction")
        return {
            type: statement.type,
            quantifier: statement.quantifier,
            children: statement.children.map(NNF)
        }
    
    else if(statement.type == "negation"){
        if(statement.children[0].type == "negation"){
            return NNF(statement.children[0].children[0]);
        }
        else if (statement.children[0].type == "or"){
            console.log("here");
            return NNF({
                type: "and",
                children: statement.children[0].children.map(function(c){ return {type: "negation", children: [NNF(c)]};})
            })
        }
        else if (statement.children[0].type == "and"){
            return NNF({
                type: "or",
                children: statement.children[0].children.map(function(c){ return {type: "negation", children: [NNF(c)]}})
            })
        }
        else if(statement.children[0].type == "implication"){
            return NNF({type: "negation", children: [NNF(statement.children[0])]});
        }
        else if (["individual", "classApplication", "roleApplication"].includes(statement.children[0].type)){
            return statement;
        }
        else{
            console.error(`Taking negation of ${statement.children[0].type}?`);
        }
    }

    else if(statement.type == "complement"){
        if(statement.children[0].type == "complement"){
            return NNF(statement.children[0].children[0]);
        }
        else if (statement.children[0].type == "union"){
            return NNF({
                type: "intersection",
                children: statement.children[0].children.map(function(c){ return {type: "complement", children: [NNF(c)]};})
            })
        }
        else if (statement.children[0].type == "intersection"){
            return NNF({
                type: "union",
                children: statement.children[0].children.map(function(c){ return {type: "complement", children: [NNF(c)]}})
            })
        }

        else if ( statement.children[0].type == "restriction"){
            let restriction = statement.children[0];
            let [role, clazz] = restriction.children;
            if (restriction.quantifier == "universal"){
                return {
                    type: "restriction",
                    quantifier: "existential",
                    children: [
                        role, 
                        {type: "complement", children: [clazz]}
                    ].map(NNF)
                }
            }
            else{
                return {
                    type: "restriction",
                    quantifier: "universal",
                    children: [
                        role, 
                        {type: "complement", children: [clazz]}
                    ].map(NNF)
                }
            }
        }

        else if (statement.children[0].type == "class"){
            if (statement.children[0].name == "Empty")
                return {type: "class", name: "Universe"};
            else if (statement.children[0].name == "Universe")
                return {type: "class", name: "Empty"};
            return statement;
        }

        else if (statement.children[0].type == "subclass"){
            return NNF({type: "complement", children: [NNF(statement.children[0])]});
        }

        else{
            console.error(`Taking complement of ${statement.children[0].type}?`);
        }
    }

    else if(["and","or","intersection","union"].includes(statement.type)){
        return {
            type: statement.type,
            children: statement.children.map(NNF)
        }
    }

    else if(statement.type == "implication"){
        return {
            type: "or",
            children: [
                {type: "negation", children: [NNF(statement.children[0])]},
                NNF(statement.children[1])
            ]
        }
    }
}



// TABLEAUX ALGORITHM FROM HERE DOWN...

function standardizeIndividual(a){
    if (a.type === "individual")
        return a.name;
    else if (a.type === undefined)
        return a;
    else
        alert(`standardizeIndividual(${a}): ${a} is of type "${a.type}"`);
}

function standardizeClass(C){
    if (C.type === undefined)
        return {type: "class", name: C};
    else if (["class", "complement", "union", "intersection", "restriction"].includes(C.type))
        return C;
    else
        alert(`standardizeClass(${C}): ${C} is of type "${C.type}"`)
}

function standardizeRole(R){
    if (R.type === undefined)
        return {type: "role", name: R};
    else if (R.type === "role")
        return R;
    else
        alert(`standardizeRole(${R}): ${R} is of type "${R.type}"`)
}


// A tableaux is actually a tree...
// When we say "THE tableuax", we refer to the top of a stack of (classes, roles) pairs.
// When we apply a rule which makes a choice, the current node is popped and the 
// children are pushed on top of the stack.
// 
// When we reach a contradiction, the top of the stack is popped off and if the stack
// is empty, then we know that we've finished the proof!


class Tableaux {
    
    constructor(){
        this.stack = [{
            classes: {},
            roles: {}
        }];
    }


    get classes() {
        return this.stack[0].classes;
    }
  
    set classes(cs){
        this.stack[0].classes = cs;
    }
    
    get roles() {
        return this.stack[0].roles;
    }

    set roles(rs){
        this.stack[0].roles = rs;
    }


    addClass(a, C){
        a = standardizeIndividual(a);
        C = standardizeClass(C);

        if(this.classes[a] == undefined)
            this.classes[a] = new Set();

        if(this.individualHasClass(a,C))
            return
        
        this.classes[a].add(C);
    }

    addRole(a, b, R){
        ([a,b] = [a,b].map(standardizeIndividual));
        R = standardizeRole(R);

        if(this.roles[[a,b]] == undefined)
            this.roles[[a,b]] = new Set();

        if(this.individualsHaveRole(a,b,R))
            return

        this.roles[[a,b]].add(R);
    }

    individualHasClass(a, C){
        a = standardizeIndividual(a);
        C = standardizeClass(C);
        
        if (this.classes[a] === undefined)
            return false;
        let cs = Array.from(this.classes[a]);
        return any(cs.map(c => (renderStatement(c) == renderStatement(C))));
    }

    individualsHaveRole(a, b, R){
        a = standardizeIndividual(a);
        b = standardizeIndividual(b);
        R = standardizeRole(R);

        if (this.roles[[a,b]] === undefined)
            return false;

        let rs = Array.from(this.roles[[a,b]]);
        return any(rs.map(r => (renderStatement(r) == renderStatement(R))));
    }

    individualStrHasRole(ab, R){
        if (this.roles[ab] === undefined)
            return false;

        let rs = Array.from(this.roles[ab]);
        return any(rs.map(r => (renderStatement(r) == renderStatement(R))));
    }

    toString(){
        let s = "";
        
        // classes
        for(let a of Object.keys(this.classes)){
            s += `$$ ${L}(${a}) = \\{`
            s += Array.from(this.classes[a]).map(c => renderStatement(c)).join(", ");
            s += `\\} $$`;
        }

        // roles (ab is a string because JS object keys are always strings)
        for(let ab of Object.keys(this.roles)){
            s += `$$ ${L}(${ab}) = \\{`;
            s += Array.from(this.roles[ab]).map(r => renderStatement(r)).join(", ");
            s += `\\} $$`;
        }

        return s;
    }

}


function copyTableauxStackTop(stackTop){
    let copy = {
        classes: {},
        roles: {}
    }

    for(let a of Object.keys(stackTop.classes)){
        let s = new Set();
        for(let c of stackTop.classes[a]){
            s.add(c);
        }
        copy.classes[a] = s;
    }

    for(let ab of Object.keys(stackTop.roles)){
        let s = new Set();
        for(let r of stackTop.roles[ab]){
            s.add(r);
        }
        copy.roles[a] = s;
    }

    return copy;
}



// returns a "tableaux"
function initTableaux(nnfStatements){
    let tableaux = new Tableaux();

    for(let statement of nnfStatements){
        let DFS_stack = [statement];
        while(DFS_stack.length != 0){
            let node = DFS_stack.shift();
            if(node.type == "negation"){
                if(node.children[0].type == "classApplication"){
                    let C = node.children[0].children[0];
                    let a = node.children[0].children[1].name;
                    tableaux.addClass(a, {type: "complement", children: [C]});
                }

                // WTF to do here???
                else if(node.children[0].type == "roleApplication"){
                    let R = node.children[0].children[0];
                    let a = node.children[0].children[1].name;
                    let b = node.children[0].children[2].name;
                    // ...
                }
            }
            else if(node.type == "classApplication"){
                let C = node.children[0];
                let a = node.children[1].name;
                tableaux.addClass(a, C);
            }
            else if(node.type == "roleApplication"){
                let R = node.children[0];
                let a = node.children[1].name;
                let b = node.children[2].name;
                tableaux.addRole(a,b,R);
            }
        }
    }

    if(Object.keys(tableaux.classes).length == 0){
        tableaux.classes["a"] = new Set();
    }

    return tableaux;
}

// checks if a tableaux contains a contradiction (a lethal one...)
function contradiction(tableaux){
    if(tableaux.stack.length == 0){
        return false;
    }

    for(let a of Object.keys(tableaux.classes)){
        let classes = Array.from(tableaux.classes[a]);
        for(let c of classes){
            if(c.name == "Empty"){
                return true;
            }

            let complement = NNF({type: "complement", children: [c]});
            if(tableaux.individualHasClass(a, complement)){
                return true;
            }
        }
    }

    return false;
}


let rules = {
    intersection: function(tableaux, nnfStatements){
        let individuals = Object.keys(tableaux.classes);
        
        let individual = null;
        let intersection = null;

        intersectionLoop:
        for(let a of individuals){
            for(let s of Array.from(tableaux.classes[a]).filter(x => x.type == "intersection")){
                if(tableaux.individualHasClass(a,s) && !all(s.children.map(c => tableaux.individualHasClass(a,c)))){
                    for(let c of s.children){
                        tableaux.addClass(a, c);
                    }
                    individual = a;
                    intersection = s;
                    break intersectionLoop;
                }
            }
        }

        if (individual){
            let intersectionText = intersection.children.map(renderStatement).join(", ");
            displayInfo(`Applied $\\sqcap$-Rule:<br><br> $ ${L}(${individual}) \\leftarrow \{ ${intersectionText} \} $`);
            return true;
        }

        return false;
    },

    union: function(tableaux, nnfStatements){
        let individuals = Object.keys(tableaux.classes);
        
        let individual = null;
        let union = null;

        unionLoop:
        for(let a of individuals){
            for(let s of Array.from(tableaux.classes[a]).filter(x => x.type == "union")){
                if(tableaux.individualHasClass(a,s) && !any(s.children.map(c => tableaux.individualHasClass(a,c)))){
                    let clean = tableaux.stack.shift();
                    s.children.slice().reverse().forEach(function(c){
                        let dirtyCopy = copyTableauxStackTop(clean);
                        tableaux.stack.unshift(dirtyCopy);
                        tableaux.addClass(a, c);
                    });
                
                    individual = a;
                    union = s;
                    break unionLoop;
                }
            }
        }

        if (individual){
            displayInfo(`Applied $\\sqcup$-Rule:<br><br> $ ${L}(${individual}) \\leftarrow ${renderStatement(union.children[0])}$`);
            return true;
        }

        return false;
    },

    existential: function(tableaux, nnfStatements){
        return false;
    },

    universal: function(tableaux, nnfStatements){
        let individuals = Object.keys(tableaux.classes);

        for(let a of individuals){
            let universalRestrictions = Array.from(tableaux.classes[a]).filter(x => x.type == "restriction" && x.quantifier == "universal");
            for(let clazz of universalRestrictions){
                let R = clazz.children[0];
                let C = clazz.children[1];
                for(let b of individuals){
                    if(tableaux.individualsHaveRole(a,b,R) && !tableaux.individualHasClass(b, C)){
                        tableaux.addClass(b,C);
                        displayInfo(`Applied $\\forall$ Rule:<br><br>$ ${L}(${b}) \\leftarrow ${renderStatement(C)} $`);
                        return true;
                    }
                }
            }
        }

        return false;
    },

    tbox: function(tableaux, nnfStatements){
        let individuals = Object.keys(tableaux.classes);

        let newIndividual = null;
        let newClass = null;

        tboxLoop: // weird JS syntax that allows me to break out of multiple loops..........
        for(let s of nnfStatements.filter(isTbox)){
            for(let a of individuals){
                if(!tableaux.individualHasClass(a, s)){
                    newIndividual = a;
                    newClass = s;
                    break tboxLoop;
                }
            }
        }

        if(newIndividual != null){
            tableaux.addClass(newIndividual, newClass);
            displayInfo(`Applied T-Box Rule:<br><br> $ ${L}(${newIndividual}) \\leftarrow ${renderStatement(newClass)} $`);
            return true;
        }

        return false;
    }
}


// try to apply a rule...
// return false if no rules applied ( proof impossible )
// otherwise return the name of the rule that was applied.
function applyRule(tableaux, nnfStatements, preferredRule = null){

    let rulesLeft = new Set(Object.keys(rules));

    let rule = preferredRule;
    let ruleSuccess = false;
    while(!ruleSuccess){
        if(rulesLeft.size == 0){
            displayInfo("<span style='color:green'>There are no more applicable rules! Therefore, this set of statements is satisfiable!</span>");
            return false;
        }

        rule = preferredRule || choice(rulesLeft);
        ruleSuccess = rules[rule](tableaux, nnfStatements);

        if (!ruleSuccess) {
            rulesLeft.delete(rule);
            preferredRule = null;
        }
    }

    
    while(contradiction(tableaux)){
        displayInfo("<span style='color:yellow'>Contradiction found in the tableaux! Reverting last choice!</span>")
        tableaux.stack.shift();
        if(tableaux.stack.length == 0){
            displayInfo("<span style='color:red'>The statements have been found unsatisfiable.</span>")
        }
    }
    
    if(tableaux.stack.length != 0){
        renderTableaux();
    }
    return rule;
}












// function applyRules(tableaux, nnfStatements){
//     let rulesLeft = new Set(Object.keys(rules));
//     while((!contradiction(tableaux)) && (rulesLeft.size() != 0)){
//         applyRule(tableaux, nnfStatements, rulesLeft);
//     }
// }

// C \sqsubseteq D  ==> ~ C \union D ==>

//         union
//         /   \
//        ~     D
//        |
//        C