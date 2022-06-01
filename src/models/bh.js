const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bhSchema = new Schema(
    {
        _id: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        lux: {
            type: Number,
            required: true,
        },
        attachTo: {
            type: mongoose.Types.ObjectId,
            ref: 'Devices',
        },
    },
    {
        timestamps: true,
    },
);

const BH = mongoose.model('bh', bhSchema);
module.exports = BH;