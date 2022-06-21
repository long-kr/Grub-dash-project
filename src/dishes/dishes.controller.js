const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
    res.json({ data: dishes})
}

function bodyMustHas(propertyName) {

    return function(req, res, next) {
        const { data = {} } = req.body;
        if(data[propertyName]) {
            return next();
        };

        next({
            status: 400,
            message: `Dish must include a ${[propertyName]}`
        });
    };
};

function isPriceValid(req, res, next) {
    const { data: { price } = {} } = req.body;

    if( price < 1 || !Number.isInteger(price)) {
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        });
    };

    next();
};

function create(req, res) {
    const { data: { name, description, price, image_url} = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
}

function isIdValid(req, res, next) {
    const { dishId } = req.params;
    const dishFound = dishes.find((dish) => dish.id === dishId);
    if(dishFound) {
        res.locals.dish = dishFound;
        return next();
    };

    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    });
}

function read(req, res) {
    res.json({ data: res.locals.dish })
}

function update(req, res, next) {
    const { data: { id, name, description, price, image_url } = {}} = req.body;
    const { dishId } = req.params;

    if(id) {
        if( id !== dishId ){
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            });
        };
    }
    
    res.locals.dish.name = name;
    res.locals.dish.description = description;
    res.locals.dish.price = price;
    res.locals.dish.image_url = image_url;

    res.json({ data: res.locals.dish });
}

// function destroy (req, res) {
//     const { dishId } = req.params;
//     const index = dishes.findIndex((dish) => dish.id === (dishId));
//     const deleteDishes = dishes.splice(index, 1);

//     res.status(204);
// }

module.exports = {
    list,
    create: [
        bodyMustHas("name"),
        bodyMustHas("description"),
        bodyMustHas("price"),
        bodyMustHas("image_url"),
        isPriceValid,
        create
    ],
    read: [
        isIdValid,
        read
    ],
    update: [
        isIdValid,
        bodyMustHas("name"),
        bodyMustHas("description"),
        bodyMustHas("price"),
        bodyMustHas("image_url"),
        isPriceValid,
        update
    ],
}