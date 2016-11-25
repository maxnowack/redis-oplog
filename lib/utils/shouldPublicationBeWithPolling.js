import { Meteor } from 'meteor/meteor';

export default function (cursors) {
    let isDisabledOplog = undefined;

    cursors.forEach(cursor => {
        if (isDisabledOplog !== undefined && cursor._cursorDescription && isDisabledOplog != !!cursor._cursorDescription.disableOplog) {
            throw new Meteor.Error('The array of cursors returned must all be reactive with oplog or polling, you are not allowed to mix them up.');
        }

        if (cursor._cursorDescription) {
          isDisabledOplog = !!cursor._cursorDescription.disableOplog;
        }
    });

    return isDisabledOplog;
}
