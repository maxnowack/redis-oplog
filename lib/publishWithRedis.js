import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import shouldPublicationBeWithPolling from './utils/shouldPublicationBeWithPolling';
import PublicationFactory from './cache/PublicationFactory';
import debug from './debug';

/*
Meteor.publishWithRedis(name, function () {
 // return cursor or array of cursors
})
*/
export default function publishWithRedis(name, fn) {
    if (_.isObject(name)) {
        return _.each(name, (value, key) => {
            publishWithRedis(key, value);
        })
    }

    debug('[Main] Created publication with name: ' + name);

    Meteor.defaultPublish(name, function (...args) {
        debug('[Main] New incomming subscription for publication: ' + name);

        let cursors = fn.call(this, ...args);
        if (!cursors) return;

        if (!_.isArray(cursors)) {
            cursors = [cursors];
        }

        if (shouldPublicationBeWithPolling(cursors)) {
            return cursors;
        }

        let publicationEntries = [];

        PublicationFactory.queue.runTask(() => {
            cursors.forEach(cursor => {
                publicationEntries.push(
                    PublicationFactory.create(cursor, this)
                )
            });
        });

        this.onStop(() => {
            PublicationFactory.queue.runTask(() => {
                debug('[Main] Stopping the Meteor subscription for publication: ' + name);
                publicationEntries.forEach(publicationEntry => {
                    publicationEntry.removeObserver(this);
                })
            });
        });

        this.ready();
    })
};
