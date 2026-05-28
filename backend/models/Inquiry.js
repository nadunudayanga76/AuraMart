import mongoose from 'mongoose';

const inquirySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    productName: {
      type: String,
      required: true,
    },
    isReplied: {
      type: Boolean,
      required: true,
      default: false,
    },
    replyMessage: {
      type: String,
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
