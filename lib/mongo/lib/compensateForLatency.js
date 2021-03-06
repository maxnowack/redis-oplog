import RedisSubscriptionManager from '../../redis/RedisSubscriptionManager';

/**
 * Latency compensator acts exactly as a synthetic event, which is very quick
 *
 * @param channels
 * @param event
 * @param uid
 * @param doc
 * @param fields
 */
export default (channels, event, uid, doc, fields) => {
    channels.forEach(channel => {
        let subscribers = RedisSubscriptionManager.store[channel];
        if (subscribers && subscribers.length) {
            RedisSubscriptionManager.channelLastIds[channel] = uid;

            subscribers.forEach(subscriber => {
                subscriber.processSync(event, doc, fields);
                // if (subscriber.strategy !== Strategy.LIMIT_SORT) {
                //     we may have shared processors and limit_sort is not reliable
                    // syntheticProcessor(subscriber.observableCollection, event, doc)
                // }
            })
        }

        let directSubs = RedisSubscriptionManager.store[channel + '::' + doc._id];
        if (directSubs && directSubs.length) {
            RedisSubscriptionManager.channelLastIds[channel] = uid;

            directSubs.forEach(subscriber => {
                subscriber.processSync(event, doc, fields);
            })
        }
    })
}