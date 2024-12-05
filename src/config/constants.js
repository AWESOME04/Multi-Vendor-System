const QUEUES = {
    ORDER_EVENTS: {
        name: 'order_events',
        exchange: 'order_exchange',
        type: 'direct',
        routingKey: 'order.events'
    },
    NOTIFICATION_EVENTS: {
        name: 'notification_events',
        exchange: 'notification_exchange',
        type: 'fanout',
        routingKey: ''
    }
};

module.exports = { QUEUES };