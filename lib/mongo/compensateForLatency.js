import RedisSubscriptionManager from '../redis/RedisSubscriptionManager';
import syntheticProcessor from '../processors/synthetic';

/**
 * Latency compensator acts exactly as a synthetic event, which is very quick
 *
 * @param channels
 * @param event
 * @param doc
 */
export default (channels, event, doc) => {
    channels.forEach(channel => {
        var subscribers = RedisSubscriptionManager.store[channel];
        if (subscribers) {
            subscribers.forEach(subscriber => {
                syntheticProcessor(subscriber.observableCollection, event, doc)
            })
        }
    })
}