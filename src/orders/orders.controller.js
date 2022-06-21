const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
    res.json({ data: orders });
}

function bodyMustHas(propertyName) {
    return function (req, res, next) {
        const { data } = {} = req.body;

        if(data[propertyName]) {
            return next();
        };

        next({
            status: 400,
            message: `Order must include a ${propertyName}`
        });
    };
};

function isDishesValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    console.log(dishes)
    if (dishes.length > 0 && Array.isArray(dishes)) {
        next();
    }; 
    
    return next({
            status: 400,
            message: `Order must include at least one dish`
    });
    
};

function isQuantityValid(req, res, next) {
    const { data: { dishes }  = {} } = req.body;
    dishes.forEach((dish, index) => {
        if(dish.quantity < 1 || !Number.isInteger((dish.quantity))) {
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            });
        }
    });

    next();
};

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber, 
        status,
        dishes
    }

    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}


function isOrderValid(req, res, next) {
    const { orderId } = req.params;
    orderFound = orders.find((order) => order.id === orderId);
    
    if(orderFound) {
        res.locals.order = orderFound;
        return next();
    };

    next({
        status: 404,
        message: `Order id is not found: ${orderId}`
    });
};

function read(req, res) {
    res.json({ data: res.locals.order})
};

function isIdValid(req, res, next) {
    const { orderId } = req.params;
    const { data : { id } = {}} = req.body;

    if(id) {
        if( id !== orderId ) {
            return next({
                status: 400,
                message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
            })
        }
    }

    next();
};

function isStatusValid(req, res, next) {
    const { data: {status} = {} } = req.body;
    const statusValues = ["pending", "preparing", "out-for-deliver", "delivered"];

    if(statusValues.includes(status)) {
        return next();
    };

    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    });
};

function update(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dish} = {} } = req.body;
    
    res.locals.order.deliverTo = deliverTo;
    res.locals.order.mobileNumber = mobileNumber;
    res.locals.order.status = status;
    res.locals.order.dish = dish;

    res.json({ data: res.locals.order})
};

function destroy(req, res, next) {
    const { data: { status } = {} } = req.body;

    if(status !== "pending") {
        return next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`
        });
    };

    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);

    res.status(201);
};

module.exports = {
    list,
    create: [
        bodyMustHas("deliverTo"),
        bodyMustHas("mobileNumber"),
        bodyMustHas("dishes"),
        isDishesValid,
        isQuantityValid,
        create
    ],
    read: [
        isOrderValid,
        read,
    ],
    update: [
        isOrderValid,
        bodyMustHas("deliverTo"),
        bodyMustHas("mobileNumber"),
        bodyMustHas("dishes"),
        isDishesValid,
        isQuantityValid,
        isIdValid,
        isStatusValid,
        update
    ],
    delete: [
        isOrderValid,
        destroy
    ]
}
