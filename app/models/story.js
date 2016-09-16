'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema({

    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    created: { type: Date, defaut: Date.now };

});

module.exports = mongoose.model('Story', StorySchema);