const { Schema, model } = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

s3 = new aws.S3();

const PostSchema = new Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
}, {
    timestamps: true,
});

PostSchema.pre('save', function() {
    if (! this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
});

PostSchema.pre('remove', function() {
    if (process.env.STORAGE_TYPE === 's3') {
        return s3.deleteObject({
            Bucket: process.env.AWS_BUCKET,
            Key: this.key,
        }).promise();
    } else {
        return promisify(fs.unlink)(
            path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)
        );
    }
});

module.exports = model('Post', PostSchema);