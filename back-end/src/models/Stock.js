const mongoose = require('mongoose');

const purchasePointSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  },
  units: {
    type: Number,
    required: true
  }
});

const stockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  moneyInvested: {
    type: Number,
    required: true,
    default: 0
  },
  unitsOwned: {
    type: Number,
    required: true,
    default: 0
  },
  purchaseHistory: [purchasePointSchema],
  averageCostBasis: {
    type: Number,
    default: 0
  },
  companyName: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index on userId and symbol to ensure uniqueness
//stockSchema.index({ userId: 1, symbol: 1 }, { unique: true });

// Method to calculate average cost basis
stockSchema.methods.calculateAverageCostBasis = function() {
  if (this.unitsOwned <= 0) return 0;
  return this.moneyInvested / this.unitsOwned;
};

// Pre-save hook to calculate average cost basis
stockSchema.pre('save', function(next) {
  if (this.unitsOwned > 0) {
    this.averageCostBasis = this.moneyInvested / this.unitsOwned;
  } else {
    this.averageCostBasis = 0;
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema); 